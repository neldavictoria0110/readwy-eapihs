// Sync changed resource sources into the embedded entry page before Hosting deploys.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const crypto = require('crypto');

// Find a real HTML closing tag while respecting the raw-text behavior of
// <script> and <style>. A plain lastIndexOf('</head>') can match strings in JS
// templates (for example Playlab's frame.srcdoc builder) and corrupt scripts.
function findHtmlClosingTag(markup, wantedTag) {
  const tokens = /<(script|style)\b[^>]*>|<\/(script|style|head|body)\s*>/gi;
  let rawTextTag = '';
  let match;
  while ((match = tokens.exec(markup))) {
    const openingRawTextTag = match[1]?.toLowerCase();
    const closingTag = match[2]?.toLowerCase();
    if (rawTextTag) {
      if (closingTag === rawTextTag) rawTextTag = '';
      continue;
    }
    if (openingRawTextTag) {
      rawTextTag = openingRawTextTag;
      continue;
    }
    if (closingTag === wantedTag) return match.index;
  }
  return -1;
}

const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const payloadPattern = /<script id="readwy-page-sources" type="application\/json">([\s\S]*?)<\/script>/;
const payloadMatch = html.match(payloadPattern);
if (!payloadMatch) throw new Error('The embedded READwy page payload is missing.');

const pages = JSON.parse(payloadMatch[1]);
if (typeof pages.application !== 'string') throw new Error('The embedded READwy application page is missing.');
// The train page has its own inline developer badge copy; keep it aligned with the shared source.
const developerBadgeSource = fs.readFileSync(path.join(root, 'resources/brand/devbadge.js'), 'utf8');
const developerBadgeScript = /<script\b(?=[^>]*\bdata-source=["']RWBADGE["'])[^>]*>[\s\S]*?<\/script>/gi;
let developerBadgeCopiesSynced = 0;
// Every page that carries its own badge copy (start-up, login, journey map, video) gets the same source,
// so the badge picks the right colours on every screen.
for (const pageName of ['application', 'train', 'launch', 'map', 'video']) {
  if (typeof pages[pageName] !== 'string') continue;
  pages[pageName] = pages[pageName].replace(developerBadgeScript, tag => {
    developerBadgeCopiesSynced += 1;
    return `${tag.slice(0, tag.indexOf('>') + 1)}${developerBadgeSource}</script>`;
  });
}
if (developerBadgeCopiesSynced === 0) throw new Error('The embedded developer badge source could not be found.');
const legacyTeacherDeveloperRoute = /if\(v==='teacher'\)\{teacher\(\);location\.href='index\.html\?journeyModule=reports';return\}/g;
// Choosing Teacher on the start screen opens the teacher login / sign-up card, the same as Student.
// (Older builds sent Teacher straight to the developer preview; the developer badge still offers that preview.)
const legacyStartupTeacherSelection = "function chooseReadwyRole(role){if(flipping||mode!=='role')return;if(role==='teacher'){window.readwyOpenDeveloperTeacherPreview(true);return}applyReadwyRole(role);turnRoleCard(false)}";
const previousStartupTeacherSelection = "function chooseReadwyRole(role){if(flipping||mode!=='role')return;if(role==='teacher'){window.readwyOpenDeveloperTeacherPreview();return}applyReadwyRole(role);turnRoleCard(false)}";
const startupTeacherSelection = "function chooseReadwyRole(role){if(flipping||mode!=='role')return;applyReadwyRole(role);turnRoleCard(false)}";
let developerRoutesPatched = 0;
let startupTeacherSelectionsPatched = 0;
for (const [pageName, pageSource] of Object.entries(pages)) {
  if (typeof pageSource !== 'string') continue;
  let updatedPage = pageSource.replace(legacyTeacherDeveloperRoute, () => {
    developerRoutesPatched += 1;
    return "if(v==='teacher'){window.readwyOpenDeveloperTeacherPreview();return}";
  });
  updatedPage = updatedPage.replace(legacyStartupTeacherSelection, () => {
    startupTeacherSelectionsPatched += 1;
    return startupTeacherSelection;
  });
  updatedPage = updatedPage.replace(previousStartupTeacherSelection, () => {
    startupTeacherSelectionsPatched += 1;
    return startupTeacherSelection;
  });
  pages[pageName] = updatedPage;
}
const hasTeacherPreviewRoute = Object.values(pages).some(pageSource =>
  typeof pageSource === 'string' && pageSource.includes("location.href='index.html?view=teacher-preview'")
);
if (developerRoutesPatched === 0 && !hasTeacherPreviewRoute) {
  throw new Error('The embedded developer teacher route could not be found.');
}
const hasStartupTeacherSelection = Object.values(pages).some(pageSource =>
  typeof pageSource === 'string' && pageSource.includes(startupTeacherSelection)
);
if (startupTeacherSelectionsPatched === 0 && !hasStartupTeacherSelection) {
  throw new Error('The startup teacher boarding-pass route could not be found.');
}
// Sign-up page: the Section list follows the chosen grade (school section names).
if (typeof pages.train === 'string') {
  const signupSectionsSource = fs.readFileSync(path.join(root, 'resources/signup-sections.js'), 'utf8');
  const signupSectionsScript = /<script data-source="resources\/signup-sections\.js">[\s\S]*?<\/script>/;
  const signupSectionsTag = `<script data-source="resources/signup-sections.js">${signupSectionsSource}</script>`;
  if (signupSectionsScript.test(pages.train)) {
    pages.train = pages.train.replace(signupSectionsScript, () => signupSectionsTag);
  } else {
    const trainBodyClose = findHtmlClosingTag(pages.train, 'body');
    if (trainBodyClose < 0) throw new Error('The sign-up page has no closing body tag.');
    pages.train = pages.train.slice(0, trainBodyClose) + signupSectionsTag + pages.train.slice(trainBodyClose);
  }
}
// Smoothness pass: the same lightweight stylesheet runs on every embedded page.
const performanceCssSource = fs.readFileSync(path.join(root, 'resources/performance.css'), 'utf8');
const performanceStyleTag = `<style data-source="resources/performance.css">${performanceCssSource}</style>`;
const performanceStylePattern = /<style data-source="resources\/performance\.css">[\s\S]*?<\/style>/gi;
for (const [pageName, pageSource] of Object.entries(pages)) {
  if (typeof pageSource !== 'string') continue;
  const withoutOldStyle = pageSource.replace(performanceStylePattern, '');
  const headClose = findHtmlClosingTag(withoutOldStyle, 'head');
  if (headClose < 0) continue;
  pages[pageName] = withoutOldStyle.slice(0, headClose) + performanceStyleTag + withoutOldStyle.slice(headClose);
}
// Login page: keep the full sign-up record after sign-in on any device.
if (typeof pages.train === 'string') {
  let train = pages.train;
  const patch = (oldText, newText, label) => {
    if (train.includes(newText)) return;
    const variants = train.includes('\r\n')
      ? [[oldText, newText], [oldText.replace(/\n/g, '\r\n'), newText.replace(/\n/g, '\r\n')]]
      : [[oldText, newText]];
    for (const [oldVariant, newVariant] of variants) {
      const count = train.split(oldVariant).length - 1;
      if (count === 1) { train = train.replace(oldVariant, newVariant); return; }
    }
    throw new Error(`Login profile patch ${label} did not match exactly once.`);
  };
  patch("const profile=saved||{role:readwyRole,email,name:'',grade:7};",
    "const profile=(window.readwyTrainProfileFor?.(email)||saved||{role:readwyRole,email,name:'',grade:7});",
    'profile fallback');
  patch('function readwyAuthenticated(user){', 'async function readwyAuthenticated(user){', 'async auth');
  const hydrateBefore = ' closeReadwyEmailDialog();\n showTrainSubjects();';
  const hydrateAfter = ' closeReadwyEmailDialog();\n showTrainSubjects();\n Promise.resolve(window.readwyHydrateTrainProfile?.(user)).catch(error=>console.error(\'READwy profile sync failed\',error));';
  const hydrateAwaited = ' closeReadwyEmailDialog();\n try{await window.readwyHydrateTrainProfile?.(user)}catch(error){console.error(\'READwy profile sync failed\',error)}\n showTrainSubjects();';
  if (train.includes(hydrateAwaited)) train = train.replace(hydrateAwaited, hydrateAfter);
  else patch(hydrateBefore, hydrateAfter, 'firestore hydration');
  // The eye button changes the password input to type=text, so read it by id/name
  // instead of by type. Otherwise a revealed password is treated as empty.
  patch(" const email=form.querySelector('input[type=email]').value.trim().toLowerCase();\n const password=form.querySelector('input[type=password]')?.value||'';",
    " const email=(form.querySelector('input[type=email]')?.value||'').trim().toLowerCase();\n const password=(form.querySelector('#lp')||form.querySelector('input[name=password]')||form.querySelector('input[type=password]')||{}).value||'';",
    'revealed password');
  const flipOld = "matchMedia('(prefers-reduced-motion:reduce)').matches?0:1000";
  const flipNew = "matchMedia('(prefers-reduced-motion:reduce)').matches?0:600";
  if (!train.includes(flipNew)) {
    const flipCount = train.split(flipOld).length - 1;
    if (flipCount < 1) throw new Error('Login card flip timing was not found.');
    train = train.split(flipOld).join(flipNew);
  }
  // Keep the address on the journey as soon as a subject is chosen. If iOS
  // reloads during the animated hand-off, it now reopens the map, not sign-in.
  patch(" const subjectStatus=document.getElementById('subjectStatus');\n if(subjectStatus)subjectStatus.textContent='Opening your English learning journey…';\n if(matchMedia('(prefers-reduced-motion:reduce)').matches){location.assign('index.html?view=map');return}",
    " const subjectStatus=document.getElementById('subjectStatus');\n if(subjectStatus)subjectStatus.textContent='Opening your English learning journey…';\n try{history.replaceState(null,'',location.pathname+'?view=map');sessionStorage.setItem('readwyJourneyOpened','1')}catch{}\n if(matchMedia('(prefers-reduced-motion:reduce)').matches){location.assign('index.html?view=map');return}",
    'journey address memory');
  // Going back to the sign-in card clears the journey guard.
  patch("function returnToTrainLogin(){\n window.__readwyAuthEntered=false;",
    "function returnToTrainLogin(){\n window.__readwyAuthEntered=false;\n try{sessionStorage.removeItem('readwyJourneyOpened')}catch{}",
    'clear journey address memory');
  const profileSyncSource = fs.readFileSync(path.join(root, 'resources/profile-train-sync.js'), 'utf8');
  const profileSyncTag = `<script type="module" data-source="resources/profile-train-sync.js">${profileSyncSource}</script>`;
  train = train.replace(/<script type="module" data-source="resources\/profile-train-sync\.js">[\s\S]*?<\/script>/i, '');
  const trainBodyClose = findHtmlClosingTag(train, 'body');
  if (trainBodyClose < 0) throw new Error('The sign-up page has no closing body tag.');
  pages.train = train.slice(0, trainBodyClose) + profileSyncTag + train.slice(trainBodyClose);
  pages.train = pages.train.replace(/<script data-source="resources\/train-subject-launch\.js">[\s\S]*?<\/script>/gi, '');
}
// Startup / login page: spacing between the frames and the card, and the title's position.
if (typeof pages.train === 'string') {
  const layoutSource = fs.readFileSync(path.join(root, 'resources/login-layout.js'), 'utf8');
  const layoutScript = /<script data-source="resources\/login-layout\.js">[\s\S]*?<\/script>/;
  const layoutTag = `<script data-source="resources/login-layout.js">${layoutSource}</script>`;
  if (layoutScript.test(pages.train)) {
    pages.train = pages.train.replace(layoutScript, () => layoutTag);
  } else {
    const trainBodyClose = findHtmlClosingTag(pages.train, 'body');
    if (trainBodyClose < 0) throw new Error('The login page has no closing body tag.');
    pages.train = pages.train.slice(0, trainBodyClose) + layoutTag + pages.train.slice(trainBodyClose);
  }
}
// Learner sign-up: LRN must be on the chosen section's class list, one LRN per account (resources/lrn-verify.js).
if (typeof pages.train === 'string') {
  const lrnSource = fs.readFileSync(path.join(root, 'resources/lrn-verify.js'), 'utf8');
  const lrnScript = /<script data-source="resources\/lrn-verify\.js">[\s\S]*?<\/script>/;
  const lrnTag = `<script data-source="resources/lrn-verify.js">${lrnSource}</script>`;
  if (lrnScript.test(pages.train)) {
    pages.train = pages.train.replace(lrnScript, () => lrnTag);
  } else {
    const trainBodyClose = findHtmlClosingTag(pages.train, 'body');
    if (trainBodyClose < 0) throw new Error('The sign-up page has no closing body tag.');
    pages.train = pages.train.slice(0, trainBodyClose) + lrnTag + pages.train.slice(trainBodyClose);
  }
}
// Shared full-screen layout guard: every frame and information panel gets its
// own band of the viewport, including on the GST stop and small phone screens.
const journeyLayoutCssSource = fs.readFileSync(path.join(root, 'resources/journey-layout.css'), 'utf8');
const journeyLayoutStyleTag = `<style data-source="resources/journey-layout.css">${journeyLayoutCssSource}</style>`;
const journeyLayoutStylePattern = /<style data-source="resources\/journey-layout\.css">[\s\S]*?<\/style>/gi;
for (const [pageName, pageSource] of Object.entries(pages)) {
 if (typeof pageSource !== 'string') continue;
 const withoutOldStyle = pageSource.replace(journeyLayoutStylePattern, '');
 const headClose = findHtmlClosingTag(withoutOldStyle, 'head');
 if (headClose < 0) continue;
 pages[pageName] = withoutOldStyle.slice(0, headClose) + journeyLayoutStyleTag + withoutOldStyle.slice(headClose);
}

  // Mobile safety: pause heavy map canvas loops too.
  for (const [pageName, pageSource] of Object.entries(pages)) {
    if (typeof pageSource !== 'string') continue;
    pages[pageName] = pageSource.split(
      "const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced-motion');"
    ).join(
      "const reduce=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('reduced-motion')||(typeof window.readwyMobileSafetyActive==='function'&&window.readwyMobileSafetyActive());"
    );
  }
// Route WST through render() and modulePage so direct links and restores open it.
for (const [pageName, pageSource] of Object.entries(pages)) {
  if (typeof pageSource !== 'string' || !pageSource.includes("function render(){setOwl(page);")) continue;
  let p = pageSource;
  p = p.replace(
    "function render(){setOwl(page);if(page==='orst-welcome')renderORSTWelcome();else if(page==='settings')renderSettings();else if(page==='profile')renderProfile();else renderWork();renderToolbar()}",
    "function render(){setOwl(page);if(page==='wst')return renderWSTInterface();if(page==='orst-welcome')renderORSTWelcome();else if(page==='settings')renderSettings();else if(page==='profile')renderProfile();else renderWork();renderToolbar()}"
  );
  p = p.replace(
    "if(mod==='reports')return renderReports();}",
    "if(mod==='reports')return renderReports();if(['wst','srst'].includes(mod))return openWST();}"
  );
  pages[pageName] = p;
}
// Use the correct assessment name everywhere, including embedded journey labels.
for (const [pageName, pageSource] of Object.entries(pages)) {
 if (typeof pageSource !== 'string') continue;
 pages[pageName] = pageSource.replace(/General\s+(?:SKills|Skills)\s+Test/gi, 'Group Screening Test');
}

// modulePage srst routing fix: srst should open WST, not GST.
for (const [pageName, pageSource] of Object.entries(pages)) {
  if (typeof pageSource !== 'string') continue;
  pages[pageName] = pageSource.replace(
    "if(['gst','srst'].includes(mod))return renderGST(mod);",
    "if(mod==='gst')return renderGST(mod);"
  );
}
// Journey map: show locked stages (journey order and score-based placement).
if (typeof pages.map === 'string') {
  const gateMapSource = fs.readFileSync(path.join(root, 'resources/journey-gate-map.js'), 'utf8');
  const gateMapScript = /<script data-source="resources\/journey-gate-map\.js">[\s\S]*?<\/script>/;
  const gateMapTag = `<script data-source="resources/journey-gate-map.js">${gateMapSource}</script>`;
  if (gateMapScript.test(pages.map)) {
    pages.map = pages.map.replace(gateMapScript, () => gateMapTag);
  } else {
    const mapHeadClose = findHtmlClosingTag(pages.map, 'head');
    if (mapHeadClose < 0) throw new Error('The journey map has no closing head tag.');
    pages.map = pages.map.slice(0, mapHeadClose) + gateMapTag + pages.map.slice(mapHeadClose);
  }
}
// Journey ticket page: the Badge Shop (coins from practice work buy badges and ticket finishes).
if (typeof pages.map === 'string') {
  const shopSource = fs.readFileSync(path.join(root, 'resources/badge-shop.js'), 'utf8');
  const shopScript = /<script data-source="resources\/badge-shop\.js">[\s\S]*?<\/script>/;
  const shopTag = `<script data-source="resources/badge-shop.js">${shopSource}</script>`;
  if (shopScript.test(pages.map)) pages.map = pages.map.replace(shopScript, () => shopTag);
  else {
    const shopHeadClose = findHtmlClosingTag(pages.map, 'head');
    if (shopHeadClose < 0) throw new Error('The journey map has no closing head tag.');
    pages.map = pages.map.slice(0, shopHeadClose) + shopTag + pages.map.slice(shopHeadClose);
  }
}
// Older builds inserted these tags by searching for the last textual
// "</head>"/"</body>". That also matched srcdoc strings inside Playlab and
// left full login documents embedded inside JavaScript. Remove those generated
// injections before rebuilding the document at its actual HTML boundaries.
let application = pages.application
  .replace(/<script>window\.readwyDeveloperAuthSource="[\s\S]*?";<\/script>/g, '')
  .replace(/<link\b(?=[^>]*\bhref=["']resources\/new-story\.css(?:\?[^"']*)?["'])[^>]*>/gi, '')
  .replace(/<link\b(?=[^>]*\bid=["']teacher-portal-style["'])[^>]*>/gi, '')
  .replace(/<link\b(?=[^>]*\bhref=["']resources\/startup-slide\.css(?:\?[^"']*)?["'])[^>]*>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/teacher-portal\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/profile-lock\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/profile-sync\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/performance-runtime\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/gst-results\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/gst-magic\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/journey-gate\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/grade-lock\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/orst-mic-help\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/summary-(?:back|hd)\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/aral-train\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '')
  .replace(/<script\b(?=[^>]*\bsrc=["']resources\/firebase-client\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi, '');
const storyStyleTag = /<style\b(?=[^>]*\bdata-source=["']resources\/new-story\.css["'])[^>]*>[\s\S]*?<\/style>/i;
if (!storyStyleTag.test(application)) throw new Error('The new-story stylesheet source tag is missing.');
const storyStyles = fs.readFileSync(path.join(root, 'resources/new-story.css'), 'utf8');
application = application.replace(storyStyleTag, tag => `${tag.slice(0, tag.indexOf('>') + 1)}${storyStyles}</style>`);
// GST's embedded book script is older than its source file; patch just the two
// profile-spread lines so Gender appears and the form can be kept in sync/locked.
for (const [oldText, newText, label] of [
  ["form.className='gst-utility-form';form.id='gstUtilityForm';",
    "form.className='gst-utility-form student-profile';form.id='gstUtilityForm';",
    'GST profile form class'],
  ["['grade','section','teacherName','email'].forEach(name=>field(name,rightBody));",
    "['grade','section','gender','teacherName','email'].forEach(name=>field(name,rightBody));",
    'GST profile gender field']
]) {
  if (application.includes(newText)) continue;
  const count = application.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${label} matched ${count} times.`);
  application = application.replace(oldText, newText);
}
const assetUrl = relativePath => {
  const contents = fs.readFileSync(path.join(root, relativePath));
  const version = crypto.createHash('sha256').update(contents).digest('hex').slice(0, 12);
  return `${relativePath}?v=${version}`;
};

const embeddedSources = new Set([
  'resources/new-story.js',
  'resources/sra/express.js',
  'resources/navigation.js',
  'resources/startup-slide.js',
  'resources/single-entry.js',
  'resources/journey-entry.js',
  'resources/interv/welcome.js',
  'resources/page-memory.js',
  'resources/interv/playlab.js',
  'resources/orst/teacher-accounts.js',
  'resources/gst-book/book.js'
]);
application = application.replace(/<script data-source="resources\/subject-labs\.js">[\s\S]*?<\/script>/gi, '');
application = application.replace(
  /<script\b([^>]*\bdata-source=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/script>/gi,
  (tag, attributes, source) => {
    if (!embeddedSources.has(source)) return tag;
    const sourcePath = path.resolve(root, source.replace(/[\\/]/g, path.sep));
    if (!sourcePath.startsWith(root + path.sep) || !fs.existsSync(sourcePath)) return tag;
    return `<script${attributes}>${fs.readFileSync(sourcePath, 'utf8')}</script>`;
  }
);

const teacherCssTag = `<link id="teacher-portal-style" rel="stylesheet" href="${assetUrl('resources/teacher-portal.css')}">`;
const updatedHeadClose = findHtmlClosingTag(application, 'head');
application = application.slice(0, updatedHeadClose) +
  teacherCssTag +
  application.slice(updatedHeadClose);

const firebaseScript = /<script\b(?=[^>]*\bsrc=["']resources\/firebase-client\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/i;
const firebaseTag = '<script type="module" src="resources/firebase-client.js"></script>';
// profile-sync.js runs after the teacher portal so it can reuse its section list and wrap its Firebase session hook.
const teacherTag = `<script data-stylesheet="${assetUrl('resources/teacher-portal.css')}" src="${assetUrl('resources/teacher-portal.js')}"></script>` +
  `<script src="${assetUrl('resources/profile-sync.js')}"></script>` +
  `<script src="${assetUrl('resources/profile-lock.js')}"></script>` +
  `<script src="${assetUrl('resources/performance-runtime.js')}"></script>` +
  `<script src="${assetUrl('resources/gst-magic.js')}"></script>` +
  `<script src="${assetUrl('resources/gst-results.js')}"></script>` +
  `<script src="${assetUrl('resources/journey-gate.js')}"></script>` +
  `<script src="${assetUrl('resources/grade-lock.js')}"></script>` +
  `<script src="${assetUrl('resources/orst-mic-help.js')}"></script>` +
  `<script src="${assetUrl('resources/summary-hd.js')}"></script>` +
  `<script src="${assetUrl('resources/aral-train.js')}"></script>` +
  `<script src="${assetUrl('resources/welcome-voice.js')}"></script>`;
if (firebaseScript.test(application)) {
  application = application.replace(firebaseScript, match => `${teacherTag}${match}`);
} else {
  const bodyClose = findHtmlClosingTag(application, 'body');
  if (bodyClose < 0) throw new Error('The embedded READwy application has no closing body tag.');
  application = application.slice(0, bodyClose) + teacherTag + firebaseTag + application.slice(bodyClose);
}
// document.open()/write() replaces the initial page's globals. Re-seed the
// original developer login source inside the rewritten application document.
const authSourceLiteral = JSON.stringify(pages.train)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
const authSourceTag = `<script>window.readwyDeveloperAuthSource=${authSourceLiteral};</script>`;
const authHeadClose = findHtmlClosingTag(application, 'head');
application = application.slice(0, authHeadClose) + authSourceTag + application.slice(authHeadClose);
pages.application = application;
// Natural speech pace on every screen: put resources/speech-pace.js first in every page's <head>,
// including the documents nested inside the application (SRA, WST and post-test frames).
{
  const paceTag = `<script data-source="resources/speech-pace.js">${fs.readFileSync(path.join(root, 'resources/speech-pace.js'), 'utf8')}</script>`;
  const pacePattern = /<script data-source="resources\/speech-pace\.js">[\s\S]*?<\/script>/g;
  const headOpen = /<head(\s[^>]*)?>/i;
  const withPace = doc => { doc = doc.replace(pacePattern, ''); const m = doc.match(headOpen); return m ? doc.slice(0, m.index + m[0].length) + paceTag + doc.slice(m.index + m[0].length) : doc; };
  const encodeJson = x => JSON.stringify(x).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  // Keep SRA Reading Lab express document in sync from source file.
  try {
    const sraPath = path.join(root, 'resources/sra/v3/app.html');
    const booksPath = path.join(root, 'resources/sra/v3/books.js');
    if (fs.existsSync(sraPath)) {
      let sraHtml = fs.readFileSync(sraPath, 'utf8');
      if (sraHtml.includes('/*__BOOKS__*/')) {
        if (!fs.existsSync(booksPath)) throw new Error('The SRA BOOKS dataset is missing.');
        sraHtml = sraHtml.replace('/*__BOOKS__*/', fs.readFileSync(booksPath, 'utf8').trim());
      }
      if (!sraHtml.includes('const BOOKS=')) throw new Error('The SRA BOOKS dataset was not embedded.');
      if (pages.application) pages.application = pages.application.replace(/(<script type="application\/json" id="sra-express-document">)([\s\S]*?)(<\/script>)/g, (all, open, raw, close) => open + encodeJson(sraHtml) + close);
    }
  } catch (e) { throw new Error(`SRA reading lab sync failed: ${e.message}`); }
  for (const key of Object.keys(pages)) {
    if (typeof pages[key] !== 'string' || !headOpen.test(pages[key])) continue;
    pages[key] = withPace(pages[key]).replace(/(<script type="application\/json" id="[a-z]+-express-document">)([\s\S]*?)(<\/script>)/g, (all, open, raw, close) => {
      try { const inner = JSON.parse(raw); return typeof inner === 'string' && headOpen.test(inner) ? open + encodeJson(withPace(inner)) + close : all; } catch { return all; }
    });
  }
}

// User-visible journey labels: keep programme IDs/routes/selectors untouched.
{
  const syncLabel = (oldText, newText, expected, label) => {
    let oldCount = 0, newCount = 0;
    for (const source of Object.values(pages)) {
      if (typeof source !== 'string') continue;
      oldCount += source.split(oldText).length - 1;
      newCount += source.split(newText).length - 1;
    }
    if (oldCount === 0) {
      if (newCount !== expected) throw new Error(`Embedded label '${label}' expected ${expected} updated copies, found ${newCount}.`);
      return;
    }
    if (oldCount !== expected) throw new Error(`Embedded label '${label}' expected ${expected} old copies, found ${oldCount}.`);
    for (const [name, source] of Object.entries(pages)) {
      if (typeof source === 'string') pages[name] = source.split(oldText).join(newText);
    }
  };
  syncLabel("sra:'Reading Lab'", "sra:'READwy Reading Lab'", 2, 'labelOf');
  syncLabel("sra: 'Reading Lab'", "sra: 'READwy Reading Lab'", 1, 'journey names');
  syncLabel("['Reading Lab','index.html?journeyModule=sra']", "['READwy Reading Lab','index.html?journeyModule=sra']", 0, 'programme list');
  syncLabel("['Journey map','Inkventure','Reading Lab']", "['Journey map','Inkventure','READwy Reading Lab']", 6, 'grade filter');
  syncLabel("['.sra-express-frame','Reading Lab']", "['.sra-express-frame','READwy Reading Lab']", 6, 'screen titles');
  syncLabel("' · Inkventure and Reading Lab only'", "' · Inkventure and READwy Reading Lab only'", 6, 'grade note');
  syncLabel('aria-label="6. Reading Lab"', 'aria-label="6. READwy Reading Lab"', 1, 'station label');
  syncLabel("['Reading Lab Guided Reading','Read at your own level.'", "['READwy Reading Lab Guided Reading','Read at your own level.'", 1, 'station name');
  syncLabel("const short=['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','Reading Lab','Post-Test'];", "const short=['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','READwy Reading Lab','Post-Test'];", 1, 'short labels');
  syncLabel("['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','Reading Lab','Post-Test'][i]", "['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','READwy Reading Lab','Post-Test'][i]", 1, 'board labels');
  syncLabel("'READING LAB','POST'", "'READWY READING LAB','POST'", 1, 'stop caps');
  syncLabel("This school year, explore the Catch-Up Express, Inkventure and Reading Lab programs.", "This school year, explore the Catch-Up Express, Inkventure and READwy Reading Lab programs.", 1, 'grade message');
  syncLabel("the open journeys are Inkventure and Reading Lab.", "the open journeys are Inkventure and READwy Reading Lab.", 1, 'grade note message');
  // The journey ticket keeps its own short title; SINGLE JOURNEY and Platform 7½ are unchanged.
  syncLabel("const SH=['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','Reading Lab','Post-Test'];", "const SH=['Keypass','Voice Station','Spellscript','Catch-Up Express','Inkventure','READwy Lab','Post-Test'];", 1, 'ticket title');
}

const safePayload = JSON.stringify(pages)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
const updatedHtml = html.replace(
  payloadPattern,
  () => `<script id="readwy-page-sources" type="application/json">${safePayload}</script>`
);
const entryScript = /<script\s+type=["']module["']\s*>[\s\S]*?<\/script>/i;
if (!entryScript.test(updatedHtml)) throw new Error('The index.html entry loader is missing.');
const entrySource = fs.readFileSync(path.join(root, 'resources/single-entry.js'), 'utf8');
const updatedIndex = updatedHtml.replace(
  entryScript,
  () => `<script type="module">${entrySource}</script>`
);
// Set the mobile safety flag before the station canvas script runs. The page
// source is later written into a fresh document, so performance-runtime.js
// reapplies the class and the flag itself survives the document rewrite.
const mobileSafetyScript = `<script>
(()=>{
 try{
  const coarse=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
  const small=Math.min(screen.width,screen.height)<=820||matchMedia('(max-width: 900px)').matches;
  const iPhone=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  window.__READWY_MOBILE_SAFETY__=coarse&&(small||iPhone);
 }catch(error){window.__READWY_MOBILE_SAFETY__=false}
 window.readwyMobileSafetyActive=()=>window.__READWY_MOBILE_SAFETY__===true;
 document.documentElement.classList.toggle('rw-mobile-safe',window.readwyMobileSafetyActive());
})();
</script>`;
const stationSceneTag = '<script src="resources/station-scene.js"></script>';
let finalIndex = updatedIndex;
if (finalIndex.includes(stationSceneTag) && !finalIndex.includes('window.__READWY_MOBILE_SAFETY__')) {
  finalIndex = finalIndex.replace(stationSceneTag, () => mobileSafetyScript + stationSceneTag);
}
// Always the newest version, whatever link was used (tinyurl …?v=2, ?v=12, Firebase):
// every build gets an id, written to build.json. A page that opens (or is restored from the
// browser's memory) with an older id reloads once. It never reloads in the middle of an activity.
const updateCheckPattern = /<script data-readwy-update="[a-z0-9]*">[\s\S]*?<\/script>/g;
finalIndex = finalIndex.replace(updateCheckPattern, '');
const buildId = require('crypto').createHash('sha1').update(finalIndex).digest('hex').slice(0, 12);
const updateCheckScript = `<script data-readwy-update="${buildId}">(()=>{try{
 if(window.top!==window||location.protocol==='file:')return;
 const mine='${buildId}',key='readwy-updated-to';
 const check=()=>fetch('build.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(b=>{
  if(!b||!b.id||b.id===mine)return;
  try{if(sessionStorage.getItem(key)===b.id)return;sessionStorage.setItem(key,b.id)}catch(e){}
  location.reload();
 }).catch(()=>{});
 setTimeout(check,1200);
 addEventListener('pageshow',e=>{if(e.persisted)check()});
}catch(e){}})();</script>`;
finalIndex = finalIndex.replace('<meta charset="utf-8">', () => '<meta charset="utf-8">' + updateCheckScript);
if (!finalIndex.includes(`data-readwy-update="${buildId}"`)) throw new Error('Could not add the update check to index.html.');
fs.writeFileSync(indexPath, finalIndex);

const publicRoot = path.join(root, 'public');
fs.mkdirSync(path.join(publicRoot, 'resources'), { recursive: true });
for (const relativePath of [
  'resources/new-story.js',
  'resources/station-scene.js',
  'resources/interv/welcome.js',
  'resources/teacher-portal.js',
  'resources/brand/devbadge.js',
  'resources/sra/v3/app.html',
  'resources/sra/v3/books.js',
  'resources/sra/express.js',
  'resources/sra/welcome.css',
  'resources/teacher-portal.css',
  'resources/profile-sync.js',
  'resources/profile-lock.js',
  'resources/performance-runtime.js',
  'resources/gst-magic.js',
  'resources/gst-results.js',
  'resources/journey-gate.js',
  'resources/grade-lock.js',
  'resources/orst-mic-help.js',
  'resources/journey-gate-map.js',
  'resources/summary-hd.js',
  'resources/aral-train.js',
  'resources/wst/skills.js',
  'resources/summary/summary-nobar.png',
  ...['01', '02', '03', '04', '05', '06', '07', '08'].map(n => `resources/wst/v2/edge_wst${n}.png`),
  'resources/gst-book/window-chocolate-hills.jpg',
  'resources/gst-book/window-photo-credit.json',
  'resources/gst-book/wizard-rider-1.svg',
  'resources/gst-book/wizard-rider-2.svg',
  'resources/teacher-portal/owl.png',
  'resources/teacher-portal/gem-blue.png',
  'resources/teacher-portal/gem-green.png',
  'resources/teacher-portal/train.png',
  'resources/teacher-portal/bridge.png',
  'resources/teacher-portal/backdrop.webp',
  'resources/brand/devbadge.js',
  'resources/new-story.css',
  'resources/journey-layout.css',
  'resources/startup-slide.css',
  'resources/readwy-login-title.svg',
  'resources/wst/interface.css',
  'resources/firebase-client.js',
  'resources/train-line-closeup-final.jpg',
  'resources/journey-stage-parts/book.webp'
]) {
  const source = path.join(root, relativePath);
  const destination = path.join(publicRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
fs.copyFileSync(indexPath, path.join(publicRoot, 'index.html'));
// build.json tells open pages which version is current (see the update check above). Copy it to render/ too.
const buildJson = JSON.stringify({ id: buildId, builtAt: new Date().toISOString() }) + '\n';
fs.writeFileSync(path.join(publicRoot, 'build.json'), buildJson);
fs.writeFileSync(path.join(root, 'build.json'), buildJson); // the same for opening READwy from this folder
console.log('synchronized embedded app and teacher-report resources for Firebase Hosting (build ' + buildId + ')');
