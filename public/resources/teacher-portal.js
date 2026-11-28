const READWY_TEACHER_JOURNEYS = [
  ['GST', 'Keypass'],
  ['Post-Test', 'Post-Test Express'],
  ['ORST', 'Voice Station'],
  ['WST', 'Spellscript'],
  ['ARAL', 'Catch-Up Express learning journey'],
  ['Intervention', 'Inkventure learning journey'],
  ['SRA', 'READwy Reading Lab']
];
const READWY_TEACHER_GRADES = [7, 8, 9, 10, 11, 12];
// School section names per grade, from the "Section Names" enrolment files (SY 2026–2027).
// Grade 11 and 12 list the section name only; the strand (STEM, ABM, HUMSS, ICT, …) is not part of it.
const READWY_TEACHER_SECTIONS_BY_GRADE = {
  7: ['Aguinaldo', 'Agoncillo', 'Aquino', 'Bonifacio', 'Del Pilar', 'Escoda', 'Jacinto', 'Jaena', 'Luna', 'Mabini', 'Palma', 'Paterno', 'Ponce', 'Rizal'],
  8: ['Argon', 'Carbon', 'Gold', 'Iron', 'Krypton', 'Mercury', 'Oxygen', 'Platinum', 'Silver', 'Sodium', 'Thallium', 'Zinc'],
  9: ['Atalia', 'Balagtas', 'Bautista', 'Caparas', 'Galang', 'Gonzales', 'Hernandez', 'Joaquin', 'Ravelo', 'Reyes', 'Santos', 'Villa', 'Open High'],
  10: ['Alcala', 'Alcaraz', 'Almeda', 'Banzon', 'Belardo', 'Campos', 'Concepcion', 'Flores', 'Olivera', 'Quisumbing', 'Vergara', 'Open High'],
  11: ['Magsaysay', 'Osmeña', 'Quezon', 'Quirino', 'Lev', 'Peso', 'Diamond', 'Sapphire', 'Daza', 'Escalante', 'Sison', 'RAM', 'ROM'],
  12: ['Emerald', 'Yen', 'Euro', 'Abueva', 'Nakpil', 'Amorsolo', 'Joaquin', 'Flores', 'Benitez', 'Royol', 'Windows', 'Linux', 'Ampere', 'Farad']
};
function readwyTPSectionsFor(grade) {
  return READWY_TEACHER_SECTIONS_BY_GRADE[Number(grade)] || [];
}
function readwyTPSectionOptions(grade, selected = '') {
  return `<option value="">Choose a section</option>${readwyTPSectionsFor(grade).map(name =>
    `<option${name === selected ? ' selected' : ''}>${readwyTPEscape(name)}</option>`).join('')}`;
}
const readwyTeacherPortalStylesheet = document.currentScript?.dataset.stylesheet;
const READWY_TP_ART = 'resources/teacher-portal/';
// Each section letter gets its own gem colour. Extra colours are tinted from the two gem drawings.
const READWY_TP_GEMS = [
  ['gem-blue.png', ''],
  ['gem-green.png', ''],
  ['gem-blue.png', 'hue-rotate(22deg) saturate(1.4) brightness(.8)'],
  ['gem-blue.png', 'hue-rotate(150deg) saturate(1.5)'],
  ['gem-blue.png', 'hue-rotate(78deg) saturate(1.2)'],
  ['gem-green.png', 'hue-rotate(-62deg) saturate(1.45) brightness(1.08)'],
  ['gem-green.png', 'hue-rotate(62deg) saturate(1.1)'],
  ['gem-blue.png', 'hue-rotate(118deg) saturate(.7) brightness(1.15)']
];
const READWY_TP_GEM_COLORS = ['#1e88e5', '#22a34a', '#4f46e5', '#e0245e', '#9b4dca', '#e8a20c', '#14a3a0', '#ec6fa9'];
// The developer preview has no Firebase account, so sections added there are kept in this browser only.
const READWY_TP_PREVIEW_KEY = 'READWY_teacher_preview_sections_v1';
const READWY_TP_ICONS = {
  dashboard: '<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.6V20h4.8v-5.6h3.4V20h4.8V9.6"/>',
  sections: '<circle cx="8.6" cy="8" r="3.2"/><circle cx="16.4" cy="8.8" r="2.6"/><path d="M2.8 19.4c.6-3.5 2.9-5.4 5.8-5.4s5.2 1.9 5.8 5.4Z"/><path d="M15 14.1c.5-.2 1-.3 1.5-.3 2.4 0 4.1 1.7 4.6 4.8h-4.4"/>',
  assessments: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="m8.5 13 2.4 2.4 4.6-5"/>',
  journeys: '<path d="M14.4 4.6c2.6-1.1 4.7-1.1 5.1-.7.4.4.4 2.5-.7 5.1L13 14.8 9.2 11Z"/><path d="M9.2 11 6 10.6l-2 2 3.6 1.1M13 14.8l.4 3.2-2 2-1.1-3.6"/><circle cx="15.3" cy="8.7" r="1.4"/><path d="M6.6 17.4 4 20"/>',
  reports: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M9 11h6M9 14.5h6M9 18h4"/>',
  arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M7.5 13h1M11.5 13h1M15.5 13h1M7.5 16.5h1M11.5 16.5h1"/>',
  grade: '<path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5Z"/><path d="M6.5 11.5v4.2c1.4 1.4 3.3 2.1 5.5 2.1s4.1-.7 5.5-2.1v-4.2M21.5 9.5v5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  person: '<circle cx="12" cy="9" r="4" fill="currentColor"/><path d="M4.5 20.5c.9-4 3.8-6 7.5-6s6.6 2 7.5 6Z" fill="currentColor"/>',
  signout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  next: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m6 12.5 4 4 8-9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.4"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.6L20 16M20 20v-4h-4"/>',
  bars: '<path d="M5 20V12M10.5 20V7M16 20v-5M21 20H3" stroke-width="3"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0Z" fill="currentColor"/><path d="M8 6H4.5a3.5 3.5 0 0 0 4 4M16 6h3.5a3.5 3.5 0 0 1-4 4M12 13v4M8.5 20h7M10 17h4"/>'
};
function readwyTPIcon(name, className = '') {
  return `<svg class="tp-svg${className ? ` ${className}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${READWY_TP_ICONS[name] || ''}</svg>`;
}
// Photographic train-station backdrop (one image file, darkened in CSS so cards stay readable).
function readwyTPScenery() {
  return '<div class="tp-sky" aria-hidden="true"></div>';
}
// Locomotive in the sidebar's colours: train-photo green body, gold trim, yellow lamps and wheel rims.
function readwyTPLocomotive() {
  const wheel = (cx, cy, r) => `<g class="tp-wheel"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#0e2a18" stroke="#f7d23e" stroke-width="4"/><path d="M${cx - r + 4} ${cy}H${cx + r - 4}M${cx} ${cy - r + 4}V${cy + r - 4}M${cx - r * .65} ${cy - r * .65}L${cx + r * .65} ${cy + r * .65}M${cx + r * .65} ${cy - r * .65}L${cx - r * .65} ${cy + r * .65}" stroke="#a9cdb2" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="${r * .28}" fill="#f7d23e"/></g>`;
  return `<div class="tp-loco" aria-hidden="true"><svg viewBox="0 0 300 160">
    <g class="tp-smoke"><circle class="tp-puff" cx="218" cy="18" r="11" fill="#eef3fa"/><circle class="tp-puff" cx="218" cy="18" r="9" fill="#dde6f1"/><circle class="tp-puff" cx="218" cy="18" r="12" fill="#f5f8fc"/></g>
    <rect x="0" y="104" width="26" height="8" rx="3" fill="#0e2a18"/><circle cx="6" cy="108" r="6" fill="none" stroke="#f7d23e" stroke-width="3"/>
    <rect x="18" y="122" width="250" height="10" rx="4" fill="#0e2a18"/>
    <rect x="22" y="36" width="84" height="88" rx="9" fill="#1f4b2d"/>
    <rect x="14" y="26" width="100" height="15" rx="7" fill="#e0b84d"/>
    <rect x="38" y="50" width="52" height="32" rx="6" fill="#ffd23f" stroke="#f7d23e" stroke-width="3"/>
    <path d="M64 50v32" stroke="#1f4b2d" stroke-width="3"/>
    <rect x="22" y="98" width="84" height="9" fill="#e0b84d"/>
    <text x="64" y="94" fill="#fff" font-family="Segoe UI,Arial,sans-serif" font-size="11" font-weight="800" text-anchor="middle">READwy</text>
    <rect x="104" y="62" width="150" height="60" rx="28" fill="#1f4b2d"/>
    <rect x="104" y="96" width="150" height="9" fill="#e0b84d"/>
    <rect x="150" y="62" width="7" height="60" fill="#f7d23e"/><rect x="204" y="62" width="7" height="60" fill="#f7d23e"/>
    <ellipse cx="176" cy="62" rx="16" ry="10" fill="#f7d23e"/>
    <path d="M206 64V32h24v32Z" fill="#143a22"/><rect x="200" y="26" width="36" height="9" rx="3" fill="#f7d23e"/>
    <circle cx="256" cy="80" r="11" fill="#fff6c2" stroke="#f7d23e" stroke-width="4"/>
    <path d="M252 122h20l22 26h-42Z" fill="#f7d23e"/>
    <rect x="60" y="133" width="62" height="6" rx="3" fill="#cfd8e3"/>
    ${wheel(62, 136, 20)}${wheel(122, 136, 20)}${wheel(192, 141, 14)}${wheel(232, 141, 14)}
  </svg></div>`;
}
// The locomotive pulls the new page in from the left, then uncouples and rolls off to the right.
let readwyTPAnimateNext = true;
function readwyTPRunTrain(portal) {
  const workspace = portal.querySelector('.tp-scene-workspace');
  const content = workspace?.querySelector('.tp-scene-content');
  const loco = workspace?.querySelector('.tp-loco');
  // Every page arrives with a short fade-and-rise; the little train still runs across the top.
  if (content && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { content.classList.remove('tp-enter'); void content.offsetWidth; content.classList.add('tp-enter') }
  if (!content || !loco || typeof content.animate !== 'function') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const shift = content.offsetLeft + content.offsetWidth;
  const exit = workspace.clientWidth + loco.offsetWidth + 40;
  const pull = {duration: 1050, easing: 'cubic-bezier(.33,.66,.3,1)'};
  loco.classList.add('is-running');
  content.classList.add('tp-enter');
  loco.animate([{transform: 'translate(0,-50%)'}, {transform: `translate(${shift}px,-50%)`}], pull).finished
    .then(() => loco.animate([{transform: `translate(${shift}px,-50%)`}, {transform: `translate(${exit}px,-50%)`}], {duration: 380, easing: 'ease-in'}).finished)
    .catch(() => {})
    .finally(() => loco.classList.remove('is-running'));
}
function readwyTPGemSlot(item, index = 0) {
  // Each section keeps the same gem colour: its position in its grade's section list.
  const name = String(item.section || '').trim().toLowerCase();
  const slot = readwyTPSectionsFor(item.grade).findIndex(section => section.toLowerCase() === name);
  return (slot >= 0 ? slot : Math.max(index, 0)) % READWY_TP_GEMS.length;
}
function readwyTPGem(item, index = 0, className = 'tp-gem') {
  const [file, filter] = READWY_TP_GEMS[readwyTPGemSlot(item, index)];
  return `<img class="${className}" src="${READWY_TP_ART}${file}" width="109" height="86" alt=""${filter ? ` style="filter:${filter}"` : ''}>`;
}
function readwyTPIsPreview() {
  return !!(window.readwyDeveloperTeacherPreview && user?.role === 'teacher' && user?.dev === true);
}
function readwyTPPreviewSections() {
  try {
    const list = JSON.parse(localStorage.getItem(READWY_TP_PREVIEW_KEY) || '[]');
    return Array.isArray(list) ? list.filter(item => item && item.id && item.section && READWY_TEACHER_GRADES.includes(Number(item.grade))) : [];
  } catch {
    return [];
  }
}
function readwyTPSavePreviewSections(list) {
  try { localStorage.setItem(READWY_TP_PREVIEW_KEY, JSON.stringify(list)); return true; }
  catch { return false; }
}
function readwyTPClassKey(grade, section) {
  return `${Number(grade)}|${String(section || '').trim().toLowerCase()}`;
}
// Keep only learners (and their records and reports) who belong to one of the teacher's own sections.
function readwyTPScopeData(data) {
  const classrooms = (data?.classrooms || []).slice().sort((a, b) =>
    Number(a.grade) - Number(b.grade) || String(a.section).localeCompare(String(b.section)));
  const codes = new Set(classrooms.map(item => String(item.id).toLowerCase()));
  const keys = new Set(classrooms.map(item => readwyTPClassKey(item.grade, item.section)));
  const roster = (data?.roster || []).filter(student =>
    codes.has(String(student.classCode || '').toLowerCase()) || keys.has(readwyTPClassKey(student.grade, student.section)));
  const uids = new Set(roster.map(student => student.uid));
  return {
    classrooms,
    roster,
    records: (data?.records || []).filter(record => uids.has(record.studentUid)),
    interventions: (data?.interventions || []).filter(report => uids.has(report.studentUid)),
    // Quest progress (Main Quest %, points) of the teacher's own learners only.
    progress: (data?.progress || []).filter(item => uids.has(item.studentUid || item.id))
  };
}
let readwyTeacherData = null;
let readwyTPWaitedForSession = false; // the portal waits once for Firebase to confirm a teacher who just signed in
let readwyTeacherSelectedStudent = '';
let readwyTeacherSearch = '';
let readwyTeacherView = 'overview';
let readwyTeacherGradeView = '';
let readwyTeacherSectionKey = '';
let readwyTeacherReturnView = 'journeys';
let readwyTeacherChecksTab = 'matrix';
let readwyTeacherStudentTab = 'journey';
let readwyTeacherInterventionDraft = false;
let readwyTeacherClassNotice = '';
let readwyFirebaseSignupWrapper;
let readwyFirebaseModuleWrapper;
let readwyFirebaseToolbarWrapper;
let readwyGradeAccessWrapper;
let readwyStartupTeacherPreviewActive = false;

function readwyTPEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function readwyTPDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '—';
}
function readwyTPMillis(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}
function readwyTPPercent(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? `${Number(value).toFixed(1)}%`
    : 'Not scored';
}
function readwyTPStatus(status) {
  const label = String(status || 'not-recorded').replaceAll('-', ' ');
  const pending = ['awaiting review', 'submitted', 'planned', 'in progress', 'not recorded'].includes(label);
  return `<span class="tp-badge${pending?' pending':''}">${readwyTPEscape(label)}</span>`;
}
function readwyTPRecordsFor(uid) {
  return (readwyTeacherData?.records || []).filter(record => record.studentUid === uid);
}
function readwyTPReportsFor(uid) {
  return (readwyTeacherData?.interventions || []).filter(report => report.studentUid === uid)
    .sort((a,b) => readwyTPMillis(b.updatedAt) - readwyTPMillis(a.updatedAt));
}
function readwyTPStudent(uid) {
  return readwyTeacherData?.roster.find(student => student.uid === uid);
}
function readwyTPClasses() {
  return readwyTeacherData?.classrooms || [];
}
function readwyTPPageName(view) {
  return ({
    dashboard: 'Welcome Aboard',
    sections: 'My Sections',
    assessments: 'Learning Checks',
    journeys: 'Reading Journeys',
    reports: 'Classroom Progress'
  })[view] || 'Welcome Aboard';
}
function readwyTPEscapedCsvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function readwyTPDownload(filename, rows) {
  const csv = rows.map(row => row.map(readwyTPEscapedCsvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff', csv], {type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function readwyTPClassRows() {
  const scoped = readwyTPScopedUids();
  const records = (readwyTeacherData?.records || []).filter(record => scoped.has(record.studentUid));
  return [
    ['Learner','LRN','Grade','Section','Learning area','Journey','Record','Status','Score','Total','Percent','Completed','Objective accomplishment','Details'],
    ...records.map(record => {
      const student = readwyTPStudent(record.studentUid) || {};
      return [
        student.name, student.lrn, student.grade, student.section, student.learningArea,
        record.journey, record.title, record.status, record.score, record.total,
        record.scorePercent, readwyTPDate(record.completedAt), record.objectiveReport, record.details
      ];
    })
  ];
}
function readwyTPObjectiveRows(student) {
  const records = readwyTPRecordsFor(student.uid);
  return [
    ['Learner','LRN','Grade','Section','Journey','Objective / record','Accomplishment','Score','Percent','Completed','Evidence'],
    ...READWY_TEACHER_JOURNEYS.map(([journey, title]) => {
      const matches = records.filter(record => record.journey === journey);
      if (!matches.length) return [[student.name,student.lrn,student.grade,student.section,journey,title,'No digital record received','', '', '', 'Not assessed / not submitted']];
      return matches.map(record => [
        student.name,student.lrn,student.grade,student.section,journey,record.title,
        record.objectiveReport,record.score,record.scorePercent,readwyTPDate(record.completedAt),record.details
      ]);
    }).flat()
  ];
}
function readwyTPJourneyCards(student) {
  const records = readwyTPRecordsFor(student.uid);
  return `<div class="tp-journey-grid">${READWY_TEACHER_JOURNEYS.map(([journey,title]) => {
    const matches = records.filter(record => record.journey === journey)
      .sort((a,b) => readwyTPMillis(b.completedAt) - readwyTPMillis(a.completedAt));
    if (!matches.length) {
      const note = journey === 'SRA'
        ? 'No digital Reading Lab assessment is configured yet. Source passages are available, but this journey does not currently save a learner result.'
        : 'No result has been synced. This is not a zero score.';
      return `<article class="tp-journey"><h4>${readwyTPEscape(title)}</h4><p>${readwyTPStatus('not-recorded')}</p><p>${readwyTPEscape(note)}</p></article>`;
    }
    return `<article class="tp-journey"><h4>${readwyTPEscape(title)}</h4>${matches.map(record => `
      <div class="tp-detail"><strong>${readwyTPEscape(record.title)}</strong><p>${readwyTPStatus(record.status)}${record.score !== undefined ? ` · ${readwyTPEscape(record.score)}/${readwyTPEscape(record.total)} (${readwyTPPercent(record.scorePercent)})` : ''}</p>
      <p>${readwyTPEscape(record.objectiveReport)}</p><small>Recorded ${readwyTPEscape(readwyTPDate(record.completedAt))}</small>
      <details><summary>View saved record details</summary><pre>${readwyTPEscape(record.details)}</pre></details></div>`).join('')}</article>`;
  }).join('')}</div>`;
}
function readwyTPStudentRecordTable(student) {
  const records = readwyTPRecordsFor(student.uid).slice().sort((a,b) => readwyTPMillis(b.completedAt) - readwyTPMillis(a.completedAt));
  if (!records.length) return '<p class="tp-empty">No digital assessment or activity records have reached READwy yet. Older browser-only records are not imported automatically.</p>';
  return `<div class="tp-table-wrap tp-fill" data-tp-pages="tbody tr"><table class="tp-table"><thead><tr><th>Journey</th><th>Record</th><th>Status</th><th>Score</th><th>Objective accomplishment</th><th>Date</th></tr></thead><tbody>${records.map(record => `<tr><td>${readwyTPEscape(record.journey)}</td><td>${readwyTPEscape(record.title)}</td><td>${readwyTPStatus(record.status)}</td><td>${record.score !== undefined ? `${readwyTPEscape(record.score)}/${readwyTPEscape(record.total)} · ${readwyTPPercent(record.scorePercent)}` : 'Not scored'}</td><td>${readwyTPEscape(record.objectiveReport)}</td><td>${readwyTPEscape(readwyTPDate(record.completedAt))}</td></tr>`).join('')}</tbody></table></div>`;
}
function readwyTPInterventionList(student) {
  const reports = readwyTPReportsFor(student.uid);
  if (!reports.length) return '<p class="tp-empty">No teacher-authored intervention report has been saved for this learner.</p>';
  return `<div class="tp-report-list tp-fill" data-tp-pages=".tp-report">${reports.map(report => `<article class="tp-report"><h4>${readwyTPEscape(report.targetSkill)} · ${readwyTPStatus(report.status)}</h4><p><strong>Support strategy:</strong> ${readwyTPEscape(report.supportStrategy)}</p><p><strong>Observed outcome:</strong> ${readwyTPEscape(report.observedOutcome)}</p><p><strong>Next steps:</strong> ${readwyTPEscape(report.nextSteps)}</p><small>Review date: ${readwyTPEscape(readwyTPDate(report.reviewAt))} · Updated: ${readwyTPEscape(readwyTPDate(report.updatedAt))}</small></article>`).join('')}</div>`;
}
// One learner, shown as three tabs so each part fits on one screen.
function readwyTPStudentView(student) {
  const reports = readwyTPReportsFor(student.uid);
  const records = readwyTPRecordsFor(student.uid);
  const tab = readwyTeacherStudentTab;
  const tabs = `<div class="tp-tabs" role="tablist" aria-label="Learner record">${[
    ['journey', 'Learning journey'],
    ['records', `All saved records (${records.length})`],
    ['interventions', `Intervention reports (${reports.length})`]
  ].map(([key, label]) => `<button type="button" role="tab" aria-selected="${tab === key}" data-tp-action="student-tab" data-tab="${key}">${label}</button>`).join('')}</div>`;
  let body;
  if (tab === 'records') {
    body = `<section class="tp-table-card tp-fill-card">${readwyTPStudentRecordTable(student)}</section>`;
  } else if (tab === 'interventions') {
    body = readwyTeacherInterventionDraft
      ? readwyTPInterventionForm(student)
      : `<section class="tp-table-card tp-fill-card"><div class="tp-card-head"><h3>${readwyTPIcon('reports', 'tp-head-icon tp-teal')}Teacher intervention reports</h3><div class="tp-inline-actions">${reports.length ? `<button class="tp-cta tp-cta-light" type="button" data-tp-action="export-intervention">${readwyTPIcon('download')}Download (CSV)</button>` : ''}<button class="tp-cta" type="button" data-tp-action="new-intervention">${readwyTPIcon('plus')}Create intervention report</button></div></div>${readwyTPInterventionList(student)}</section>`;
  } else {
    body = `<section class="tp-table-card tp-fill-card"><div class="tp-panel-track">${readwyTPTrack(records)}</div><p class="tp-note">Saved app data only. Missing results show as “No digital record received”; no score or mastery is inferred. Keypass uses a passage-reviewed classroom key; Post-Test Express results are provisional pending teacher verification.</p><div class="tp-fill" data-tp-pages=".tp-journey">${readwyTPJourneyCards(student)}</div></section>`;
  }
  return tabs + body;
}
function readwyTPInterventionForm(student) {
  return `<section class="tp-table-card tp-fill-card"><h3>${readwyTPIcon('plus', 'tp-head-icon tp-teal')}New intervention report · ${readwyTPEscape(student.name)}</h3>
    <form class="tp-report-form tp-fill" id="tpInterventionForm" data-student="${readwyTPEscape(student.uid)}">
      <p class="tp-note">Use observed evidence from the learner’s records. Separate what was observed from the support provided and the next step.</p>
      <div class="tp-form-grid tp-form-grid-3">
        <label class="tp-field">Target skill<input class="tp-input" name="targetSkill" required maxlength="120" placeholder="e.g., oral reading accuracy"></label>
        <label class="tp-field">Review date<input class="tp-input" name="reviewAt" type="date"></label>
        <label class="tp-field">Status<select class="tp-select" name="status"><option value="planned">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
        <label class="tp-field">Support strategy<textarea class="tp-textarea" name="supportStrategy" required maxlength="1500" placeholder="Describe the practice, modeling, or materials provided."></textarea></label>
        <label class="tp-field">Observed outcome<textarea class="tp-textarea" name="observedOutcome" required maxlength="1500" placeholder="Record what the learner did; do not infer beyond the evidence."></textarea></label>
        <label class="tp-field">Next steps<textarea class="tp-textarea" name="nextSteps" required maxlength="1500" placeholder="Specify the follow-up activity and how progress will be checked."></textarea></label>
      </div>
      <div class="tp-inline-actions"><button class="tp-cta" type="submit">Save report</button><button class="tp-cta tp-cta-light" type="button" data-tp-action="cancel-intervention">Cancel</button></div><p class="tp-inline-status" role="status"></p>
    </form></section>`;
}
// Stations shown on a learner's journey track, in classroom order.
const READWY_TP_STATIONS = [['GST','Keypass'],['ORST','Voice Station'],['WST','Spellscript'],['Post-Test','Post-test'],['ARAL','Catch-Up Express'],['Intervention','Inkventure'],['SRA','Reading Lab']];
const READWY_TP_PROGRAMS = [['ARAL','Catch-Up Express','aral'],['Intervention','Inkventure','interv'],['SRA','Reading Lab','sra']];
const READWY_TP_STAT_ART = {
  sections: '<svg viewBox="0 0 64 64"><circle cx="14" cy="24" r="7" fill="#60a5fa"/><path d="M2 52c0-9 5-15 12-15 3 0 6 1 8 3-3 4-5 8-5 12Z" fill="#3b82f6"/><circle cx="50" cy="24" r="7" fill="#60a5fa"/><path d="M62 52c0-9-5-15-12-15-3 0-6 1-8 3 3 4 5 8 5 12Z" fill="#3b82f6"/><circle cx="32" cy="19" r="9" fill="#3b82f6"/><path d="M16 54c0-11 7-18 16-18s16 7 16 18Z" fill="#1d4ed8"/></svg>',
  checks: '<svg viewBox="0 0 64 64"><rect x="12" y="10" width="40" height="49" rx="7" fill="#8b5cf6"/><rect x="18" y="18" width="28" height="35" rx="3" fill="#f5f3ff"/><rect x="23" y="5" width="18" height="10" rx="3" fill="#6d28d9"/><path d="m24 35 6 6 11-12" fill="none" stroke="#7c3aed" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  journeys: '<svg viewBox="0 0 64 64"><path d="M32 17C24 11 14 10 5 12v39c9-2 19-1 27 5Z" fill="#22c55e"/><path d="M32 17c8-6 18-7 27-5v39c-9-2-19-1-27 5Z" fill="#16a34a"/><path d="M9 16c7-1 15 0 20 4v30c-5-3-13-4-20-3Z" fill="#dcfce7"/><path d="M55 16c-7-1-15 0-20 4v30c5-3 13-4 20-3Z" fill="#f0fdf4"/><path d="M13 25h12M13 31h12M39 25h12M39 31h12" stroke="#86efac" stroke-width="2.5" stroke-linecap="round"/></svg>',
  score: '<svg viewBox="0 0 64 64"><rect x="7" y="38" width="13" height="19" rx="2" fill="#fdba74"/><rect x="25" y="28" width="13" height="29" rx="2" fill="#fb923c"/><rect x="43" y="18" width="13" height="39" rx="2" fill="#f97316"/><path d="M8 30 22 20l10 4L52 7" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M43 7h9v9" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const READWY_TP_YEAR = `<span class="tp-sec-pill tp-year-top">${readwyTPIcon('calendar')}School Year 2026–2027</span>`;

// Learners enrolled in each section (from the teacher's class list), saved on this device per teacher.
function readwyTPClassSizesKey() {
  return 'READwy_tp_class_sizes_' + String(user?.id || user?.uid || user?.email || 'local').toLowerCase();
}
function readwyTPClassSizes() {
  try { return JSON.parse(localStorage.getItem(readwyTPClassSizesKey()) || '{}') || {}; } catch { return {}; }
}
function readwyTPClassSize(id) {
  const n = Number(readwyTPClassSizes()[id]);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function readwyTPSetClassSize(id, value) {
  const n = Math.round(Number(value));
  const sizes = readwyTPClassSizes();
  if (Number.isFinite(n) && n > 0 && n <= 200) sizes[id] = n; else delete sizes[id];
  try { localStorage.setItem(readwyTPClassSizesKey(), JSON.stringify(sizes)); return true; } catch { return false; }
}

function readwyTPHasScore(record) {
  return record.scorePercent !== null && record.scorePercent !== undefined && record.scorePercent !== '' &&
    Number.isFinite(Number(record.scorePercent));
}
function readwyTPShortDate(ms) {
  return ms ? new Date(ms).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : '';
}
function readwyTPSectionLabel(item) {
  return `Grade ${readwyTPEscape(item.grade)} · ${readwyTPEscape(item.section)}`;
}
function readwyTPStudentInClass(student, item) {
  if (!item) return true;
  return (student.classCode && String(student.classCode).toLowerCase() === String(item.id).toLowerCase()) ||
    readwyTPClassKey(student.grade, student.section) === readwyTPClassKey(item.grade, item.section);
}
// The section chosen in the section dropdown (shared by Learning Checks, Reading Journeys and Reports).
function readwyTPSelectedClass() {
  const match = readwyTPClasses().find(item => item.id === readwyTeacherSectionKey);
  if (!match) readwyTeacherSectionKey = '';
  return match || null;
}
function readwyTPScopedRoster(item = readwyTPSelectedClass()) {
  return (readwyTeacherData?.roster || []).filter(student => readwyTPStudentInClass(student, item))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}
function readwyTPScopedUids() {
  return new Set(readwyTPScopedRoster().map(student => student.uid));
}
function readwyTPLatest(records, journey) {
  return records.filter(record => record.journey === journey)
    .sort((a, b) => readwyTPMillis(b.completedAt) - readwyTPMillis(a.completedAt))[0];
}
function readwyTPScoreCell(record) {
  if (!record) return '<span class="tp-dash" title="No saved record yet">—</span>';
  if (record.score !== undefined && record.score !== null && record.score !== '') {
    return `<strong>${readwyTPEscape(record.score)}</strong>${record.total !== undefined && record.total !== '' ? `<small>/${readwyTPEscape(record.total)}</small>` : ''}`;
  }
  return readwyTPStatus(record.status);
}
function readwyTPProgramPills(records) {
  return READWY_TP_PROGRAMS.filter(([journey]) => records.some(record => record.journey === journey))
    .map(([, label, key]) => `<span class="tp-program tp-program-${key}">${label}</span>`).join('') ||
    '<span class="tp-dash" title="No program record yet">—</span>';
}
function readwyTPSectionStats(item) {
  const roster = readwyTPScopedRoster(item);
  const uids = new Set(roster.map(student => student.uid));
  const records = (readwyTeacherData?.records || []).filter(record => uids.has(record.studentUid));
  const scored = records.filter(readwyTPHasScore);
  return {
    roster,
    records,
    started: new Set(records.map(record => record.studentUid)).size,
    average: scored.length ? scored.reduce((sum, record) => sum + Number(record.scorePercent), 0) / scored.length : null,
    last: records.reduce((latest, record) => Math.max(latest, readwyTPMillis(record.completedAt)), 0)
  };
}
function readwyTPHead(kicker, title, subtitle, controls = '') {
  return `<header class="tp-sec-head"><div class="tp-sec-greet"><p class="tp-sec-kicker">${kicker}</p><h2 class="tp-scene-title">${title}</h2>${subtitle ? `<p class="tp-scene-sub">${subtitle}</p>` : ''}</div>${controls ? `<div class="tp-sec-controls">${controls}</div>` : ''}</header>`;
}
function readwyTPSectionPicker() {
  const classes = readwyTPClasses();
  const selected = readwyTPSelectedClass();
  return `<label class="tp-sec-pill tp-sec-select">${readwyTPIcon('sections')}<select id="tpSectionPick" aria-label="Choose one of your sections"><option value="">All my sections</option>${classes.map(item => `<option value="${readwyTPEscape(item.id)}" ${selected === item ? 'selected' : ''}>${readwyTPSectionLabel(item)}${item.active ? '' : ' (inactive)'}</option>`).join('')}</select>${readwyTPIcon('chevron', 'tp-sec-chevron')}</label>`;
}
function readwyTPSectionTitle(item) {
  return item
    ? `${readwyTPGem(item, readwyTPClasses().indexOf(item), 'tp-title-gem')}<span>${readwyTPSectionLabel(item)}</span>`
    : `<span class="tp-title-icon">${readwyTPIcon('sections')}</span><span>All my sections</span>`;
}
function readwyTPEmptyCard(title, text, action = '') {
  return `<div class="tp-gem-empty"><img src="${READWY_TP_ART}train.png" width="350" height="90" alt=""><strong>${title}</strong><p>${text}</p>${action}</div>`;
}
function readwyTPInfo(text) {
  return `<p class="tp-info-bar">${readwyTPIcon('info')}<span>${text}</span></p>`;
}
function readwyTPTrack(records) {
  return `<div class="tp-track"><ol>${READWY_TP_STATIONS.map(([journey, label]) => {
    const done = records.some(record => record.journey === journey);
    return `<li class="${done ? 'is-done' : ''}"><span class="tp-stop">${done ? readwyTPIcon('check') : ''}</span><span class="tp-stop-label">${label}</span><span class="tp-sr">${done ? 'record saved' : 'no record yet'}</span></li>`;
  }).join('')}</ol><img class="tp-track-train" src="${READWY_TP_ART}train.png" width="350" height="90" alt=""></div>`;
}

/* ---------- My Sections ---------- */
function readwyTPSectionCard(item, index) {
  const preview = readwyTPIsPreview();
  const code = readwyTPEscape(item.id);
  const size = readwyTPClassSize(item.id);
  const tools = `<button type="button" data-tp-action="copy-code" data-code="${code}">Copy code</button><button type="button" data-tp-action="class-size" data-code="${code}">${size ? `Enrolled: ${size}` : 'Set enrolled'}</button>${item.active ? `<button type="button" data-tp-action="deactivate-class" data-code="${code}">Deactivate</button>` : ''}${preview ? `<button type="button" data-tp-action="remove-preview-section" data-code="${code}">Remove</button>` : ''}`;
  return `<article class="tp-gem-card${item.active ? '' : ' is-inactive'}">
    <div class="tp-gem-head">${readwyTPGem(item, index)}<h4><span>Grade ${readwyTPEscape(item.grade)} ·</span> <span>${readwyTPEscape(item.section)}</span></h4></div>
    <div class="tp-gem-meta"><span class="tp-chip">${readwyTPEscape(item.learningArea || 'Class')}</span><span class="tp-chip tp-chip-code" title="Class code">${code}</span>${item.active ? '' : '<span class="tp-chip tp-chip-off">Inactive</span>'}</div>
    <img class="tp-gem-train" src="${READWY_TP_ART}train.png" width="350" height="90" alt="">
    <button class="tp-open-section" type="button" data-tp-action="open-section" data-tp-target="assessments" data-code="${code}">Open section ${readwyTPIcon('arrow')}</button>
    <div class="tp-gem-tools">${tools}</div>
  </article>`;
}
function readwyTPSectionsView(classes) {
  const grades = [...new Set(classes.map(item => String(item.grade)))].sort((a, b) => Number(a) - Number(b));
  if (readwyTeacherGradeView && !grades.includes(readwyTeacherGradeView)) readwyTeacherGradeView = '';
  const visible = classes.filter(item => !readwyTeacherGradeView || String(item.grade) === readwyTeacherGradeView);
  const firstName = user?.firstName || String(user?.name || 'Teacher').trim().split(/\s+/)[0];
  const notice = readwyTeacherClassNotice;
  readwyTeacherClassNotice = '';
  return `<header class="tp-sec-head">
      <div class="tp-sec-greet"><p class="tp-sec-kicker">My Sections</p><h2>Welcome, ${readwyTPEscape(firstName)}</h2><span class="tp-lock-pill">${readwyTPIcon('lock')}Assigned sections only</span></div>
      <div class="tp-sec-controls">
        ${READWY_TP_YEAR}
        <label class="tp-sec-pill tp-sec-select">${readwyTPIcon('grade')}<select id="tpSectionGrade" aria-label="Show sections by grade"><option value="">All assigned grades</option>${grades.map(grade => `<option value="${grade}" ${readwyTeacherGradeView === grade ? 'selected' : ''}>Grade ${grade}</option>`).join('')}</select>${readwyTPIcon('chevron', 'tp-sec-chevron')}</label>
      </div>
    </header>
    <div class="tp-sec-guide">
      <img class="tp-sec-bridge" src="${READWY_TP_ART}bridge.png" width="164" height="67" alt="">
      <p>${classes.length ? 'Choose a section to view its assessment matrix.' : 'Add the sections you handle to get a class code for each one.'}</p>
      <details class="tp-add-section">
        <summary>${readwyTPIcon('plus')}Add a section</summary>
        <div class="tp-add-panel">
          <h3>Add a section you handle</h3>
          <form id="tpClassForm" class="tp-class-form">
            <label class="tp-field">Grade<select class="tp-select" name="grade" required>${READWY_TEACHER_GRADES.map(grade => `<option>${grade}</option>`).join('')}</select></label>
            <label class="tp-field">Section<select class="tp-select" name="section" required>${readwyTPSectionOptions(READWY_TEACHER_GRADES[0])}</select></label>
            <input type="hidden" name="learningArea" value="${readwyTPEscape(user?.learningArea || 'English')}">
            <label class="tp-field">Learners enrolled (class list)<input class="tp-input" name="enrolled" type="number" min="1" max="200" inputmode="numeric" placeholder="e.g. 50"></label>
            <button class="tp-btn primary" type="submit">Create class code</button>
          </form>
          <p class="tp-inline-status" id="tpClassStatus" role="status"></p>
          <p class="tp-note">${readwyTPIsPreview() ? 'Developer preview: sections are saved in this browser only, and their codes cannot be used by learners.' : 'Share a class code only with learners who belong to that grade, section, and learning area.'}</p>
        </div>
      </details>
    </div>
    ${notice ? `<p class="tp-sec-notice" role="status">${readwyTPEscape(notice)}</p>` : ''}
    <div class="tp-sec-board" data-tp-pages=".tp-gem-card">${visible.length
      ? `<div class="tp-gem-grid">${visible.map(item => readwyTPSectionCard(item, classes.indexOf(item))).join('')}</div>`
      : readwyTPEmptyCard('No sections yet', 'Add the sections you handle. Only the sections you add appear anywhere in your portal.', `<button class="tp-cta" type="button" data-tp-action="open-add">${readwyTPIcon('plus')}Add a section</button>`)}</div>`;
}

/* ---------- Dashboard ---------- */
function readwyTPDashboardView() {
  const classes = readwyTPClasses();
  const roster = readwyTeacherData?.roster || [];
  const records = readwyTeacherData?.records || [];
  const scored = records.filter(readwyTPHasScore);
  const average = scored.length ? `${Math.round(scored.reduce((sum, record) => sum + Number(record.scorePercent), 0) / scored.length)}%` : '—';
  const pending = records.filter(record => record.status === 'awaiting-review').length;
  const started = new Set(records.map(record => record.studentUid)).size;
  const stats = classes.map((item, index) => ({item, index, ...readwyTPSectionStats(item)}));
  const ranked = stats.slice().sort((a, b) => (b.average ?? -1) - (a.average ?? -1) || b.records.length - a.records.length);
  const stat = (art, value, label, note) => `<article class="tp-stat"><span class="tp-stat-icon" aria-hidden="true">${art}</span><span><strong>${value}</strong><b>${label}</b><small>${note}</small></span></article>`;
  return `${readwyTPHead('READwy · Teacher', 'Dashboard', 'Here’s an overview of your handled sections and learner activity.', `<div class="tp-head-stack">${READWY_TP_YEAR}${readwyTPPostTestControl()}</div>
      <button class="tp-boarding-pass" type="button" data-tp-page="journeys" onclick="readwyTPNavigate(event,'journeys')" aria-label="Open your teacher boarding pass and learner journeys">
        <span class="tp-ticket-copy"><small>READwy RAIL · TEACHER LINE</small><strong>TEACHER BOARDING PASS</strong><span>Route: Reading Journeys</span></span>
        <span class="tp-ticket-status"><b>READY</b> TO BOARD</span>
      </button>`)}
    <div class="tp-sec-board tp-fit tp-dash-fit">
      <div class="tp-stats" aria-label="Classroom summary">
        ${stat(READWY_TP_STAT_ART.sections, classes.length, 'My Sections', `${classes.filter(item => item.active).length} active`)}
        ${stat(READWY_TP_STAT_ART.checks, records.length, 'Learning Checks', pending ? `${pending} awaiting review` : 'Saved learner records')}
        ${stat(READWY_TP_STAT_ART.journeys, started, 'Reading Journeys', `of ${roster.length} enrolled ${roster.length === 1 ? 'learner' : 'learners'}`)}
        ${stat(READWY_TP_STAT_ART.score, average, 'Avg. Score', scored.length ? 'Saved scores only' : 'After scored activity')}
      </div>
      <div class="tp-dash-panels">
        <section class="tp-card-panel"><div class="tp-card-head"><h3>${readwyTPIcon('trophy', 'tp-head-icon tp-gold')}Top Performing Sections</h3></div>
          <ol class="tp-top3">${[0, 1, 2].map(i => {
            // Only sections with a scored activity can be ranked; empty places show a dash.
            const entry = ranked.filter(e => e.average !== null)[i];
            return `<li class="${entry ? 'has-section' : 'is-empty'}"><span class="tp-medal tp-medal-${i + 1}">${i + 1}</span><span class="tp-top3-label">Top ${i + 1}</span>
              ${entry ? `<button type="button" class="tp-top3-name" data-tp-action="open-section" data-tp-target="assessments" data-code="${readwyTPEscape(entry.item.id)}">${readwyTPSectionLabel(entry.item)}</button>` : '<span class="tp-top3-name tp-top3-dash" aria-label="No section yet">–</span>'}
              <span class="tp-top3-score">${entry ? `${Math.round(entry.average)}%` : '–'}</span></li>`;
          }).join('')}</ol>
          <p class="tp-panel-note">Average score of each section’s saved results. Sections appear once they have scored activity.</p>
        </section>
        <section class="tp-card-panel"><div class="tp-card-head"><h3>${readwyTPIcon('bars', 'tp-head-icon tp-blue')}Class Progress</h3></div>
          ${classes.length ? `<ul class="tp-class-progress" data-tp-pages="li">${stats.map(entry => {
            const joined = entry.roster.length, size = readwyTPClassSize(entry.item.id);
            const percent = size ? Math.min(100, Math.round(joined / size * 100)) : 0;
            return `<li>${readwyTPGem(entry.item, entry.index, 'tp-row-gem')}<span class="tp-cp-body"><strong>${readwyTPSectionLabel(entry.item)}</strong>${size ? `<span class="tp-bar" role="img" aria-label="${joined} of ${size} learners signed in"><span style="width:${percent}%;background:${READWY_TP_GEM_COLORS[readwyTPGemSlot(entry.item, entry.index)]}"></span></span>` : `<button type="button" class="tp-cp-set" data-tp-action="class-size" data-code="${readwyTPEscape(entry.item.id)}">Set enrolled learners</button>`}</span>
              <span class="tp-cp-count"><b>${joined}/${size ?? '—'}</b><small>signed in</small></span></li>`;
          }).join('')}</ul><p class="tp-panel-note">Learners who signed in with your class code / learners enrolled in the class list.</p>` : readwyTPEmptyCard('Progress appears here', 'Each section shows how many of its learners have signed in.')}
        </section>
      </div>
      <p class="tp-scene-note">Records shown here are saved READwy activity from your handled sections. Missing results are not treated as zero scores.</p>
    </div>`;
}

/* ---------- Post-test date: one date for all of the teacher's sections ---------- */
const READWY_TP_PTD = { open: false, month: null, selected: null, busy: false, msg: '' };
const readwyTPDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function readwyTPFormatDay(day) {
  if (!day) return '';
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function readwyTPCurrentPostTestDate() {
  const dated = readwyTPClasses().filter(item => item.postTestDateUpdatedAt || item.postTestDate !== undefined)
    .sort((a, b) => readwyTPMillis(b.postTestDateUpdatedAt) - readwyTPMillis(a.postTestDateUpdatedAt));
  const day = dated[0]?.postTestDate;
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}
function readwyTPPostTestStatus() {
  const classes = readwyTPClasses(), day = readwyTPCurrentPostTestDate();
  if (!day) return 'No post-test date set.';
  const names = classes.map(item => `${readwyTPEscape(item.grade)}-${readwyTPEscape(item.section)}`).join(', ');
  return `Post-test opens on <b>${readwyTPFormatDay(day)}</b> for all sections (${names}).`;
}
function readwyTPCalendar() {
  const P = READWY_TP_PTD, today = readwyTPDay();
  const [y, m] = (P.month || today.slice(0, 7)).split('-').map(Number);
  const first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate(), lead = first.getDay();
  const minMonth = today.slice(0, 7), thisMonth = `${y}-${String(m).padStart(2, '0')}`;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push('<td></td>');
  for (let d = 1; d <= days; d++) {
    const day = `${thisMonth}-${String(d).padStart(2, '0')}`, past = day < today;
    const cls = [day === today ? 'is-today' : '', day === P.selected ? 'is-picked' : ''].filter(Boolean).join(' ');
    cells.push(`<td><button type="button" class="${cls}" data-tp-ptd="pick" data-day="${day}" ${past ? 'disabled aria-disabled="true"' : ''} aria-label="${readwyTPFormatDay(day)}${day === today ? ' (today)' : ''}" aria-pressed="${day === P.selected}">${d}</button></td>`);
  }
  while (cells.length % 7) cells.push('<td></td>');
  const rows = []; for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`);
  const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const current = readwyTPCurrentPostTestDate();
  return `<div class="tp-ptd-pop" role="dialog" aria-label="Choose the post-test date">
    <div class="tp-ptd-head"><button type="button" data-tp-ptd="prev" aria-label="Previous month" ${thisMonth <= minMonth ? 'disabled' : ''}>◀</button><strong>${label}</strong><button type="button" data-tp-ptd="next" aria-label="Next month">▶</button></div>
    <table class="tp-ptd-cal"><thead><tr>${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>
    <p class="tp-ptd-picked">${P.selected ? `Selected: <b>${readwyTPFormatDay(P.selected)}</b>` : 'Tap a date.'}</p>
    ${P.msg ? `<p class="tp-ptd-msg" role="status">${readwyTPEscape(P.msg)}</p>` : ''}
    <div class="tp-ptd-actions"><button type="button" class="tp-cta" data-tp-ptd="save" ${P.selected && !P.busy ? '' : 'disabled'}>${P.busy ? 'Saving…' : 'Save'}</button><button type="button" class="tp-cta tp-cta-light" data-tp-ptd="cancel">Cancel</button>${current ? '<button type="button" class="tp-cta tp-cta-light tp-ptd-clear" data-tp-ptd="clear">Clear date</button>' : ''}</div>
  </div>`;
}
function readwyTPPostTestControl() {
  return `<div class="tp-ptd"><button type="button" class="tp-cta tp-ptd-btn" data-tp-ptd="toggle" aria-expanded="${READWY_TP_PTD.open}">📅 Set Post-Test Date</button>
    <p class="tp-ptd-status">${readwyTPPostTestStatus()}</p>${READWY_TP_PTD.open ? readwyTPCalendar() : ''}</div>`;
}
function readwyTPRedrawPostTest() {
  const box = document.querySelector('.tp-ptd'); if (!box) return;
  box.outerHTML = readwyTPPostTestControl();
  document.querySelector('.tp-ptd-pop [data-tp-ptd="pick"].is-picked, .tp-ptd-pop [data-tp-ptd="pick"].is-today, .tp-ptd-pop [data-tp-ptd="cancel"]')?.focus({ preventScroll: true });
}
async function readwyTPSavePostTestDate(day) {
  const classes = readwyTPClasses();
  if (readwyTPIsPreview()) {
    const list = readwyTPPreviewSections().map(item => ({ ...item, postTestDate: day, postTestDateUpdatedAt: Date.now() }));
    readwyTPSavePreviewSections(list);
  } else {
    const api = await window.readwyFirebaseReady;
    await api.setPostTestDate(day);
  }
  classes.forEach(item => { item.postTestDate = day; item.postTestDateUpdatedAt = Date.now(); });
}
document.addEventListener('click', async event => {
  const b = event.target.closest('[data-tp-ptd]');
  const P = READWY_TP_PTD;
  if (!b) {
    if (P.open && !event.target.closest('.tp-ptd')) { P.open = false; P.msg = ''; readwyTPRedrawPostTest(); }
    return;
  }
  if (b.disabled || P.busy) return;
  const act = b.dataset.tpPtd, classes = readwyTPClasses();
  if (act === 'toggle') {
    P.open = !P.open; P.msg = '';
    P.selected = readwyTPCurrentPostTestDate();
    P.month = (P.selected && P.selected >= readwyTPDay() ? P.selected : readwyTPDay()).slice(0, 7);
  } else if (act === 'prev' || act === 'next') {
    const [y, m] = P.month.split('-').map(Number), d = new Date(y, m - 1 + (act === 'next' ? 1 : -1), 1);
    P.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  } else if (act === 'pick') {
    P.selected = b.dataset.day; P.msg = '';
  } else if (act === 'cancel') {
    P.open = false; P.msg = '';
  } else if (act === 'save' || act === 'clear') {
    if (!classes.length) { P.msg = 'Add a section first.'; readwyTPRedrawPostTest(); return; }
    const n = classes.length, word = n === 1 ? 'section' : 'sections';
    const ok = act === 'save'
      ? window.confirm(`This will set the post-test date for all ${n} ${word}. Continue?`)
      : window.confirm(`This will clear the post-test date for all ${n} ${word}. Learners will then take the Post-Test after finishing their Main Quest. Continue?`);
    if (!ok) return;
    P.busy = true; readwyTPRedrawPostTest();
    try {
      await readwyTPSavePostTestDate(act === 'save' ? P.selected : null);
      P.open = false; P.msg = '';
    } catch (error) {
      P.msg = error?.message || 'The date could not be saved. Check your connection and try again.';
    }
    P.busy = false;
  }
  readwyTPRedrawPostTest();
});
function readwyTPMainQuestCell(uid) {
  const item = (readwyTeacherData?.progress || []).find(p => (p.studentUid || p.id) === uid);
  if (!item || !item.mainQuest) return '<small class="tp-mq tp-mq-none" title="No quest data yet">Main Quest —</small>';
  const pct = Math.round(Number(item.postTestTaken ? (item.postTestMainQuestPercent ?? item.mainQuestCompletionPercent) : item.mainQuestCompletionPercent) || 0);
  const early = item.postTestTaken && item.postTestTakenBeforeDate ? ' · taken early' : '';
  return `<small class="tp-mq" title="Main Quest completion${item.postTestTaken ? ' when the post-test was taken' : ''}">Main Quest ${pct}%${early}</small>`;
}
(() => {
  const style = document.createElement('style');
  style.textContent = `
/* School Year (white) and Set Post-Test Date (green): one stack in the top-right corner, both the same size. */
.teacher-portal .tp-head-stack{position:relative;z-index:5;grid-column:1/-1;justify-self:end;display:grid;grid-template-columns:minmax(0,1fr);gap:6px;width:clamp(210px,19vw,250px)}
.teacher-portal .tp-head-stack .tp-sec-pill.tp-year-top{position:static!important;width:100%;box-sizing:border-box;justify-content:center;height:38px!important;min-height:38px!important}
.tp-ptd{position:relative;display:grid;gap:4px;width:100%}
.teacher-portal .tp-ptd-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;box-sizing:border-box;height:38px;min-height:38px!important;margin:0;padding:4px 14px!important;border-radius:999px!important;white-space:nowrap;font-size:13.5px!important;font-weight:800;letter-spacing:.02em;box-shadow:0 4px 12px rgba(6,30,19,.3)!important}
.tp-ptd-status{margin:0;padding:3px 10px;border-radius:10px;background:rgba(255,248,230,.94);box-shadow:inset 0 0 0 1px #c9a14a;font:600 11px/1.3 system-ui,sans-serif;color:#3b2a10;text-align:center}
.tp-ptd-pop{position:absolute;top:calc(100% + 6px);right:0;z-index:60;width:min(340px,calc(100vw - 24px));box-sizing:border-box;padding:12px;border-radius:16px;background:#fffdf6;color:#2b1d07;
 box-shadow:0 0 0 2px #c9a14a,0 18px 40px rgba(0,0,0,.35);animation:tpPtdIn .18s ease-out}
@keyframes tpPtdIn{from{opacity:0;transform:translateY(-6px)}}
.tp-ptd-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.tp-ptd-head strong{font:800 16px/1.2 Georgia,serif}
.tp-ptd-head button{min-width:44px;min-height:44px;border:0;border-radius:12px;background:#efe2c2;color:#3b2604;font:800 16px/1 system-ui;cursor:pointer;touch-action:manipulation}
.tp-ptd-head button:disabled{opacity:.4;cursor:not-allowed}
.tp-ptd-cal{width:100%;border-collapse:collapse;table-layout:fixed}
.tp-ptd-cal th{padding:4px 0;font:800 11px/1 system-ui;color:#8a5a00;text-transform:uppercase}
.tp-ptd-cal td{padding:2px;text-align:center}
.tp-ptd-cal button{width:100%;aspect-ratio:1;min-height:38px;border:0;border-radius:10px;background:#fff;color:#2b1d07;font:700 14px/1 system-ui;cursor:pointer;box-shadow:inset 0 0 0 1px #eadbb4;touch-action:manipulation}
.tp-ptd-cal button:hover:not(:disabled){background:#f6ead0}
.tp-ptd-cal button:disabled{background:#f1ede4;color:#b8ad98;box-shadow:none;cursor:not-allowed}
.tp-ptd-pop .tp-ptd-cal button.is-today{box-shadow:inset 0 0 0 2px #2f8a5a!important;color:#0f3a27!important;font-weight:900}
.tp-ptd-pop .tp-ptd-cal button.is-picked{background:linear-gradient(180deg,#2f8a5a,#0f3a27)!important;color:#ffe9a8!important;box-shadow:inset 0 0 0 2px #e9c46a!important;opacity:1!important}
.tp-ptd-picked,.tp-ptd-msg{margin:8px 0 0;font:600 13px/1.35 system-ui}
.tp-ptd-msg{color:#9a2a1a}
.tp-ptd-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.tp-ptd-actions .tp-cta{min-height:42px}
.tp-ptd-clear{margin-left:auto;color:#9a2a1a!important}
/* Smooth page change: the new page fades and rises in (no loading screen in between). */
.teacher-portal .tp-scene-content.tp-enter{animation:tpEnter .45s cubic-bezier(.2,.8,.25,1) both}
@keyframes tpEnter{from{opacity:0;transform:translateY(14px) scale(.992);filter:blur(2px)}to{opacity:1;transform:none;filter:none}}
@media (prefers-reduced-motion:reduce){.teacher-portal .tp-scene-content.tp-enter{animation:none}}
.tp-mq{display:block;margin-top:2px;font:700 11px/1.2 system-ui;color:#2f6b4a;white-space:nowrap}.tp-mq-none{color:#9a8a6a}
@media (max-width:650px){.teacher-portal .tp-head-stack{width:100%;justify-self:stretch;grid-template-columns:1fr 1fr;align-items:start}.teacher-portal .tp-head-stack .tp-ptd-status{grid-column:1/-1}.teacher-portal .tp-head-stack .tp-sec-pill.tp-year-top,.teacher-portal .tp-head-stack .tp-ptd-btn{font-size:12px!important;padding:4px 8px!important;white-space:nowrap}.tp-ptd{display:contents}}
@media (max-width:600px){.tp-ptd{max-width:100%}.tp-ptd-pop{position:fixed;left:12px;right:12px;top:auto;bottom:max(12px,env(safe-area-inset-bottom));width:auto;max-height:calc(100dvh - 24px);overflow:auto}}`;
  document.head.append(style);
})();

/* ---------- Learning Checks ---------- */
function readwyTPChecksView() {
  const item = readwyTPSelectedClass();
  const roster = readwyTPScopedRoster(item);
  const uids = new Set(roster.map(student => student.uid));
  const records = (readwyTeacherData?.records || []).filter(record => uids.has(record.studentUid));
  const tests = READWY_TP_STATIONS.slice(0, 4);
  const matrix = roster.length ? `<div class="tp-table-card tp-fill-card"><div class="tp-table-wrap tp-fill" data-tp-pages="tbody tr"><table class="tp-table tp-matrix"><thead><tr><th>Student</th>${tests.map(([, label]) => `<th>${label}</th>`).join('')}<th>Programs</th></tr></thead><tbody>${roster.map(student => {
      const own = records.filter(record => record.studentUid === student.uid);
      return `<tr><td><button type="button" class="tp-person" data-tp-action="student" data-uid="${readwyTPEscape(student.uid)}">${readwyTPIcon('person')}<span>${readwyTPEscape(student.name)}${item ? '' : `<small>Grade ${readwyTPEscape(student.grade)} · ${readwyTPEscape(student.section)}</small>`}</span></button></td>${tests.map(([journey]) => `<td class="tp-num">${readwyTPScoreCell(readwyTPLatest(own, journey))}${journey === 'Post-Test' ? readwyTPMainQuestCell(student.uid) : ''}</td>`).join('')}<td>${readwyTPProgramPills(own)}</td></tr>`;
    }).join('')}</tbody></table></div></div>` : readwyTPEmptyCard('No learners yet', item ? 'Learners appear here after they join this section with its class code.' : 'Learners appear here after they join one of your sections.');
  const summary = roster.length ? `<div class="tp-table-card tp-summary-card"><h3>${readwyTPIcon('bars', 'tp-head-icon tp-blue')}Assessment summary</h3><div class="tp-table-wrap"><table class="tp-table"><thead><tr><th>Assessment</th><th>Completed</th><th>Awaiting review</th></tr></thead><tbody>${tests.map(([journey, label]) => {
      const done = new Set(records.filter(record => record.journey === journey).map(record => record.studentUid)).size;
      const waiting = records.filter(record => record.journey === journey && record.status === 'awaiting-review').length;
      return `<tr><td><strong>${label}</strong></td><td class="tp-num">${done}/${roster.length}</td><td class="tp-num">${waiting}</td></tr>`;
    }).join('')}</tbody></table></div></div>` : '';
  const allRecords = records.length ? `<div class="tp-table-wrap tp-fill" data-tp-pages="tbody tr"><table class="tp-table"><thead><tr><th>Learner</th><th>Section</th><th>Journey</th><th>Status</th><th>Score</th><th>Date</th></tr></thead><tbody>${records.slice().sort((a, b) => readwyTPMillis(b.completedAt) - readwyTPMillis(a.completedAt)).map(record => {
      const student = readwyTPStudent(record.studentUid) || {};
      return `<tr><td>${readwyTPEscape(student.name || 'Learner')}<small>LRN ${readwyTPEscape(student.lrn || '—')}</small></td><td>Grade ${readwyTPEscape(student.grade)} · ${readwyTPEscape(student.section)}</td><td>${readwyTPEscape(record.journey)}<small>${readwyTPEscape(record.title)}</small></td><td>${readwyTPStatus(record.status)}</td><td>${record.score !== undefined ? `${readwyTPEscape(record.score)}/${readwyTPEscape(record.total)} · ${readwyTPPercent(record.scorePercent)}` : 'Not scored'}</td><td class="tp-nowrap">${readwyTPEscape(readwyTPShortDate(readwyTPMillis(record.completedAt)) || '—')}</td></tr>`;
    }).join('')}</tbody></table></div>` : '<p class="tp-empty">No saved records yet.</p>';
  const showRecords = readwyTeacherChecksTab === 'records';
  const tabs = roster.length ? `<div class="tp-tabs" role="tablist" aria-label="Learning checks view"><button type="button" role="tab" aria-selected="${!showRecords}" data-tp-action="checks-tab" data-tab="matrix">Score matrix</button><button type="button" role="tab" aria-selected="${showRecords}" data-tp-action="checks-tab" data-tab="records">Every saved record (${records.length})</button></div>` : '';
  return `${readwyTPHead('Learning Checks', readwyTPSectionTitle(item), 'Latest saved raw score for each learner (score / total).', `${readwyTPSectionPicker()}<button class="tp-cta" type="button" data-tp-action="objectives"${roster.length ? '' : ' disabled'}>${readwyTPIcon('download')}Download objective report</button>`)}
    <div class="tp-sec-board tp-fit tp-split">
      <section class="tp-split-main">${tabs}${roster.length ? (showRecords ? `<div class="tp-table-card tp-fill-card">${allRecords}</div>` : matrix) : matrix}</section>
      <aside class="tp-split-side">${summary}${readwyTPInfo('“—” means no saved record yet. It is never counted as a zero score.')}</aside>
    </div>`;
}

/* ---------- Reading Journeys ---------- */
function readwyTPJourneysView() {
  const item = readwyTPSelectedClass();
  const roster = readwyTPScopedRoster(item);
  return `${readwyTPHead('Reading Journeys', readwyTPSectionTitle(item), 'Each station lights up when the learner has a saved record for it.', readwyTPSectionPicker())}
    <div class="tp-sec-board" data-tp-pages=".tp-learner-card">${roster.length ? `<div class="tp-learner-grid">${roster.map(student => {
      const own = readwyTPRecordsFor(student.uid);
      return `<article class="tp-learner-card"><div class="tp-learner-head"><span class="tp-learner-avatar">${readwyTPIcon('person')}</span><div><h3>${readwyTPEscape(student.name)}</h3><p>Grade ${readwyTPEscape(student.grade)} · ${readwyTPEscape(student.section)}</p></div><span class="tp-chip">${own.length} saved ${own.length === 1 ? 'record' : 'records'}</span></div>${readwyTPTrack(own)}<button class="tp-cta tp-cta-wide" type="button" data-tp-action="student" data-uid="${readwyTPEscape(student.uid)}">Open learner journey ${readwyTPIcon('arrow')}</button></article>`;
    }).join('')}</div>` : readwyTPEmptyCard('No learner journeys yet', item ? 'Journeys appear here after learners join this section with its class code.' : 'Journeys appear here after learners join one of your sections.')}
    </div>`;
}

/* ---------- Reports ---------- */
function readwyTPReportsView() {
  const item = readwyTPSelectedClass();
  const roster = readwyTPScopedRoster(item);
  const uids = new Set(roster.map(student => student.uid));
  const records = (readwyTeacherData?.records || []).filter(record => uids.has(record.studentUid));
  const query = readwyTeacherSearch.trim().toLowerCase();
  const selectedJourney = document.getElementById('tpJourneyFilter')?.value || '';
  return `${readwyTPHead('Reports', readwyTPSectionTitle(item), 'Learners, saved records and downloads for your handled sections.', readwyTPSectionPicker())}
    <div class="tp-sec-board tp-fit tp-split">
      <section class="tp-table-card tp-fill-card tp-split-main"><h3>${readwyTPIcon('sections', 'tp-head-icon tp-blue')}Learner roster and records</h3>
        <div class="tp-filters"><label class="tp-field">Search name or LRN<input class="tp-input" id="tpSearch" value="${readwyTPEscape(readwyTeacherSearch)}" placeholder="Search roster"></label>
          <label class="tp-field">Journey<select class="tp-select" id="tpJourneyFilter"><option value="">All journeys</option>${READWY_TEACHER_JOURNEYS.map(([journey, label]) => `<option value="${journey}" ${selectedJourney === journey ? 'selected' : ''}>${readwyTPEscape(label)}</option>`).join('')}</select></label></div>
        ${readwyTPRosterTable(roster, records, query, selectedJourney)}
      </section>
      <aside class="tp-split-side">
      <section class="tp-table-card tp-export-card">
        <h3>${readwyTPIcon('download', 'tp-head-icon tp-teal')}Report scope: ${item ? readwyTPSectionLabel(item) : 'All my sections'}</h3>${readwyTPInfo('Downloads include only learners from your handled sections.')}
        <div class="tp-export-actions">
          <button class="tp-cta" type="button" data-tp-action="export-class"${records.length ? '' : ' disabled'}>${readwyTPIcon('download')}Records (CSV)</button>
          <button class="tp-cta" type="button" data-tp-action="objectives"${roster.length ? '' : ' disabled'}>${readwyTPIcon('download')}Objective report (CSV)</button>
          <button class="tp-cta" type="button" data-tp-action="export-intervention"${roster.length ? '' : ' disabled'}>${readwyTPIcon('download')}Intervention reports (CSV)</button>
          <button class="tp-cta tp-cta-light" type="button" data-tp-action="print">${readwyTPIcon('reports')}Print / Save PDF</button>
        </div>
        <a class="tp-text-link tp-philiri" href="resources/Teacher%20Reports/EAPIHS_PhilIRI_Form_1B_Reading_Report.xlsx" download title="The original Phil-IRI Form 1B workbook. READwy does not map other assessment scores into it.">${readwyTPIcon('reports')}Phil-IRI Form 1B template (original)</a>
      </section>
      <p class="tp-scene-note">Saved READwy activity only. Missing results are not zero scores. The Phil-IRI workbook is the original source template; READwy does not fill it in.</p>
      </aside>
    </div>`;
}
function readwyTPRosterTable(roster, records, query, selectedJourney) {
  const visible = roster.filter(student => {
    const haystack = `${student.name} ${student.lrn} ${student.section}`.toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!selectedJourney || records.some(record => record.studentUid === student.uid && record.journey === selectedJourney));
  });
  if (!visible.length) return roster.length
    ? '<p class="tp-empty">No learners match this search.</p>'
    : '<p class="tp-empty">No learners yet. Learners appear after they register with one of your class codes.</p>';
  return `<div class="tp-table-wrap tp-fill" data-tp-pages="tbody tr"><table class="tp-table"><thead><tr><th>Learner</th><th>Section</th><th>Programs</th><th class="tp-num">Records</th><th>Review</th><th></th></tr></thead><tbody>${visible.map(student => {
    const own = records.filter(record => record.studentUid === student.uid);
    const waiting = own.filter(record => record.status === 'awaiting-review').length;
    return `<tr><td><span class="tp-person-static">${readwyTPIcon('person')}<span>${readwyTPEscape(student.name)}<small>LRN ${readwyTPEscape(student.lrn)}</small></span></span></td><td>Grade ${readwyTPEscape(student.grade)} · ${readwyTPEscape(student.section)}</td><td>${readwyTPProgramPills(own)}</td><td class="tp-num">${own.length}</td><td>${waiting ? `<span class="tp-badge pending">${waiting} awaiting</span>` : '<span class="tp-dash">—</span>'}</td><td><button class="tp-cta tp-cta-small" type="button" data-tp-action="student" data-uid="${readwyTPEscape(student.uid)}">View ${readwyTPIcon('arrow')}</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
}

/* ---------- One learner ---------- */
function readwyTPStudentPageView() {
  const student = readwyTPStudent(readwyTeacherSelectedStudent);
  if (!student) return `${readwyTPHead('Learner record', 'Learner not found', '')}<div class="tp-sec-board">${readwyTPEmptyCard('This learner is not in your handled sections', 'Refresh your records or choose another learner.', '<button class="tp-cta" type="button" data-tp-action="overview">Back</button>')}</div>`;
  return `${readwyTPHead('Learner record', `<span class="tp-title-icon">${readwyTPIcon('person')}</span><span>${readwyTPEscape(student.name)}</span>`, `LRN ${readwyTPEscape(student.lrn)} · Grade ${readwyTPEscape(student.grade)} · ${readwyTPEscape(student.section)} · ${readwyTPEscape(student.learningArea)}`,
    `<button class="tp-cta tp-cta-light" type="button" data-tp-action="overview">← Back</button><button class="tp-cta" type="button" data-tp-action="export-student">${readwyTPIcon('download')}Objective report (CSV)</button><button class="tp-cta tp-cta-light" type="button" data-tp-action="print">Print / Save PDF</button>`)}
    <div class="tp-sec-board tp-fit tp-student-board">${readwyTPStudentView(student)}</div>`;
}

function readwyTPOverview() {
  const classes = readwyTPClasses();
  const view = readwyTeacherView;
  const body = view === 'dashboard' ? readwyTPDashboardView()
    : view === 'sections' ? readwyTPSectionsView(classes)
    : view === 'assessments' ? readwyTPChecksView()
    : view === 'journeys' ? readwyTPJourneysView()
    : view === 'reports' ? readwyTPReportsView()
    : readwyTPStudentPageView();
  const current = view === 'student' ? readwyTeacherReturnView : view;
  const pageItems = [
    ['dashboard', 'Dashboard'],
    ['sections', 'My Sections'],
    ['assessments', 'Learning Checks'],
    ['journeys', 'Reading Journeys'],
    ['reports', 'Reports']
  ];
  return `<div class="teacher-portal">
    <aside class="tp-rail"><a class="tp-brand" href="#teacher-dashboard" data-tp-page="dashboard"><img class="tp-owl" src="${READWY_TP_ART}owl.png" alt=""><span><strong>${readwyTPEscape(user?.learningArea || 'READwy')}</strong><small>Teacher Portal</small><svg class="tp-swoosh" viewBox="0 0 160 14" aria-hidden="true"><path d="M3 8.5C45 3 100 2 157 5.5"/><path d="M16 12c36-3.5 78-4.2 118-2"/></svg></span></a>
      <nav class="tp-nav" aria-label="Teacher portal">${pageItems.map(([page,label]) => {
        const locked = ['assessments','journeys','reports'].includes(page) && classes.length === 0;
        return `<button type="button" data-tp-page="${page}" aria-current="${current === page ? 'page' : 'false'}"${locked ? ' disabled title="Add a section in My Sections to unlock this page"' : ''}><span class="tp-nav-icon">${readwyTPIcon(page)}</span><span class="tp-nav-label">${label}</span></button>`;
      }).join('')}</nav>
      <div class="tp-profile"><span class="tp-avatar">${readwyTPIcon('person')}</span><span class="tp-profile-name" title="${readwyTPEscape(user?.name || 'Teacher')}"><strong>${readwyTPEscape(user?.name || 'Teacher')}</strong><small>Teacher</small></span><button class="tp-profile-out" type="button" data-tp-action="signout" aria-label="Sign out" title="Sign out">${readwyTPIcon('signout')}</button></div>
    </aside>
    <main class="tp-workspace tp-scene-workspace tp-view-${view}">${readwyTPScenery()}<div class="tp-scene-content">${body}</div>${readwyTPLocomotive()}</main>
  </div>`;
}
// Split long lists into screen-sized pages so nothing needs a scroll bar.
// A box marked data-tp-pages="<item selector>" shows only the items that fit, plus ‹ Page n of m › buttons.
function readwyTPPaginate(root = document) {
  root.querySelectorAll('[data-tp-pages]').forEach(box => {
    if (box.nextElementSibling?.classList.contains('tp-pager')) box.nextElementSibling.remove();
    const items = [...box.querySelectorAll(box.dataset.tpPages)];
    items.forEach(item => { item.hidden = false; });
    box.scrollTop = 0;
    if (items.length < 2 || box.clientHeight < 40 || box.scrollHeight <= box.clientHeight + 1) return;
    const pager = document.createElement('div');
    pager.className = 'tp-pager';
    pager.innerHTML = `<button type="button" data-dir="-1" aria-label="Previous page">${readwyTPIcon('next', 'tp-flip')}</button><span aria-live="polite"></span><button type="button" data-dir="1" aria-label="Next page">${readwyTPIcon('next')}</button>`;
    box.after(pager);
    const limit = box.getBoundingClientRect().top + box.clientHeight - (parseFloat(getComputedStyle(box).paddingBottom) || 0) + 1;
    let size = 0;
    for (const item of items) {
      if (item.getBoundingClientRect().bottom <= limit) size += 1;
      else break;
    }
    size = Math.max(1, size);
    const pages = Math.ceil(items.length / size);
    if (pages < 2) { pager.remove(); return; }
    let page = Math.min(Number(box.dataset.tpPage) || 0, pages - 1);
    const [prev, next] = pager.querySelectorAll('button');
    const show = () => {
      items.forEach((item, index) => { item.hidden = Math.floor(index / size) !== page; });
      box.dataset.tpPage = String(page);
      box.scrollTop = 0;
      pager.querySelector('span').textContent = `Page ${page + 1} of ${pages}`;
      prev.disabled = page === 0;
      next.disabled = page === pages - 1;
    };
    pager.addEventListener('click', event => {
      const button = event.target.closest('button[data-dir]');
      if (!button || button.disabled) return;
      page = Math.min(pages - 1, Math.max(0, page + Number(button.dataset.dir)));
      show();
    });
    show();
  });
}
let readwyTPPaginateTimer = null;
function readwyTPSchedulePaginate() {
  clearTimeout(readwyTPPaginateTimer);
  readwyTPPaginateTimer = setTimeout(() => {
    const portal = document.querySelector('.teacher-portal');
    if (portal) readwyTPPaginate(portal);
  }, 60);
}
window.addEventListener('resize', readwyTPSchedulePaginate);
function readwyTPDrawView() {
  const title = readwyTeacherView === 'student' && readwyTPStudent(readwyTeacherSelectedStudent)
    ? readwyTPStudent(readwyTeacherSelectedStudent).name
    : readwyTPPageName(readwyTeacherView);
  const animate = readwyTPAnimateNext;
  readwyTPAnimateNext = false;
  workLayout(title, readwyTPOverview());
  const portal = document.querySelector('.teacher-portal');
  if (!portal) return;
  if (animate) readwyTPRunTrain(portal);
  requestAnimationFrame(() => readwyTPPaginate(portal));
  portal.querySelectorAll('img').forEach(image => {
    if (!image.complete) image.addEventListener('load', readwyTPSchedulePaginate, {once: true});
  });
  document.fonts?.ready.then(readwyTPSchedulePaginate);
}
function readwyTPNavigate(event, view) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!['dashboard','sections','assessments','journeys','reports'].includes(view)) return;
  readwyTPAnimateNext = true;
  readwyRenderTeacherPortal(view);
}
function readwyRenderTeacherPortal(view = 'dashboard') {
  const developerPreview = window.readwyDeveloperTeacherPreview &&
    user?.role === 'teacher' && user?.dev === true;
  if (developerPreview) {
    readwyTeacherView = ['dashboard','sections','assessments','journeys','reports','student'].includes(view) ? view : 'dashboard';
    activeModule = 'dashboard';
    readwyTeacherData = readwyTPScopeData({classrooms: readwyTPPreviewSections(), roster: [], records: [], interventions: []});
    readwyTPDrawView();
    return;
  }
  if (user?.role !== 'teacher' || !user?.id) {
    // Coming straight from the start screen's teacher sign-in: wait once for Firebase to confirm
    // the account (and create a new DepEd teacher's profile) before deciding.
    if (window.readwyFirebaseReady && !readwyTPWaitedForSession) {
      readwyTPWaitedForSession = true;
      // The current screen stays until the account is confirmed (no white "checking" page).
      window.readwyFirebaseReady.then(() => readwyRenderTeacherPortal(view), () => readwyRenderTeacherPortal(view));
      return;
    }
    const why = window.readwyFirebaseAuthError || 'Sign in with your verified DepEd (@deped.gov.ph) teacher account to view your learners’ records. New teachers: sign up on the READwy start screen with your DepEd email, open the verification email, then sign in.';
    workLayout('Teacher access required', `<p class="notice">${readwyTPEscape(why)}</p><p><a class="tp-btn" href="index.html?view=startup">Go to teacher sign in</a></p>`);
    return;
  }
  readwyTeacherView = ['dashboard','sections','assessments','journeys','reports','student'].includes(view) ? view : 'dashboard';
  activeModule = 'dashboard';
  const requestedUid = user.id;
  // Draw the page at once: from the last records (this visit), or an empty portal the first time.
  const cached = readwyTPCacheGet(requestedUid);
  readwyTeacherData = cached || readwyTPScopeData({});
  readwyTPDrawView();
  // The Firebase client (a module) may still be loading: wait for it instead of failing.
  const firebaseReady = window.readwyFirebaseReady || new Promise(resolve => { const wait = setInterval(() => { if (window.readwyFirebaseReady) { clearInterval(wait); resolve(window.readwyFirebaseReady) } }, 60) });
  Promise.resolve(firebaseReady).then(async api => {
    try {
      if (api.profile?.role !== 'teacher' || api.auth.currentUser?.uid !== requestedUid || user?.id !== requestedUid) {
        throw new Error('Sign in with an activated teacher account to view student records.');
      }
      const fresh = readwyTPScopeData(await api.loadTeacherData());
      const changed = readwyTPCacheKey(fresh) !== readwyTPCacheKey(readwyTeacherData);
      readwyTPCacheSet(requestedUid, fresh);
      if (user?.id !== requestedUid) return;
      readwyTeacherData = fresh;
      if (changed) readwyTPQuietRedraw();
    } catch (error) {
      if (cached) return; // keep showing the last records
      if (user?.id === requestedUid) workLayout('Teacher records & reports', `<div class="teacher-portal"><p class="tp-empty" role="alert">${readwyTPEscape(error.message || 'Student records could not be loaded.')}</p><button class="tp-btn" type="button" data-tp-action="refresh">Try again</button></div>`);
    }
  }).catch(error => {
    if (user?.id === requestedUid) workLayout('Teacher records & reports', `<p class="notice" role="alert">${readwyTPEscape(error.message || 'Firebase is unavailable.')}</p>`);
  });
}
/* Teacher records kept for this browser tab, so moving between portal pages never shows a loading screen. */
const READWY_TP_CACHE = {};
const readwyTPCacheKey = data => { try { return JSON.stringify(data) } catch { return String(Math.random()) } };
function readwyTPRevive(value) {
  if (Array.isArray(value)) return value.map(readwyTPRevive);
  if (value && typeof value === 'object') {
    if (Number.isFinite(value.seconds) && Number.isFinite(value.nanoseconds) && Object.keys(value).length <= 3) {
      const ms = value.seconds * 1000 + Math.round(value.nanoseconds / 1e6);
      return { seconds: value.seconds, nanoseconds: value.nanoseconds, toDate: () => new Date(ms), toMillis: () => ms };
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, readwyTPRevive(v)]));
  }
  return value;
}
function readwyTPCacheGet(uid) {
  if (READWY_TP_CACHE[uid]) return READWY_TP_CACHE[uid];
  try { const raw = sessionStorage.getItem('readwy-tp-cache-' + uid); if (raw) return (READWY_TP_CACHE[uid] = readwyTPRevive(JSON.parse(raw))) } catch {}
  return null;
}
function readwyTPCacheSet(uid, data) {
  READWY_TP_CACHE[uid] = data;
  try { sessionStorage.setItem('readwy-tp-cache-' + uid, JSON.stringify(data)) } catch {}
}
// New records arrived: redraw in place without the page animation, unless the teacher is typing or picking a date.
function readwyTPQuietRedraw() {
  const busy = document.activeElement?.closest?.('.teacher-portal') && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (busy || READWY_TP_PTD.open) { readwyTPRedrawLater = true; return }
  const pane = document.querySelector('.teacher-portal .tp-scene-content');
  const top = pane ? pane.scrollTop : 0;
  readwyTPAnimateNext = false;
  readwyTPDrawView();
  const next = document.querySelector('.teacher-portal .tp-scene-content'); if (next) next.scrollTop = top;
}
let readwyTPRedrawLater = false;
document.addEventListener('focusout', () => { if (readwyTPRedrawLater) setTimeout(() => { if (readwyTPRedrawLater && !document.activeElement?.closest?.('.teacher-portal input,.teacher-portal textarea,.teacher-portal select')) { readwyTPRedrawLater = false; readwyTPQuietRedraw() } }, 300) });
function readwyTeacherSections() {
  return readwyRenderTeacherPortal();
}
function readwyTPReload() {
  readwyRenderTeacherPortal(readwyTeacherView);
}
function readwyTPBuildObjectiveClassRows() {
  const roster = readwyTPScopedRoster();
  return [
    ['Learner','LRN','Grade','Section','Journey','Objective / record','Accomplishment','Score','Percent','Completed','Evidence'],
    ...roster.map(student => readwyTPObjectiveRows(student).slice(1)).flat()
  ];
}
function readwyTPBuildInterventionRows(uid) {
  const scoped = readwyTPScopedUids();
  const reports = uid ? readwyTPReportsFor(uid) : (readwyTeacherData?.interventions || []).filter(report => scoped.has(report.studentUid));
  return [
    ['Learner','LRN','Grade','Section','Target skill','Support strategy','Observed outcome','Next steps','Status','Review date','Updated'],
    ...reports.map(report => {
      const student = readwyTPStudent(report.studentUid) || {};
      return [student.name,student.lrn,report.grade,report.section,report.targetSkill,report.supportStrategy,report.observedOutcome,report.nextSteps,report.status,readwyTPDate(report.reviewAt),readwyTPDate(report.updatedAt)];
    })
  ];
}

if (!document.getElementById('teacher-portal-style')) {
  const style = document.createElement('link');
  style.id = 'teacher-portal-style';
  style.rel = 'stylesheet';
  style.href = readwyTeacherPortalStylesheet || 'resources/teacher-portal.css';
  document.head.append(style);
}

window.readwySetFirebaseSession = (authUser, profile) => {
  if (!authUser || !profile) {
    if (window.readwyDeveloperTeacherPreview && user?.role === 'teacher' && user?.dev === true) return;
    // Firebase reports "no session" on every page load. Only a user who came from a Firebase sign-in is
    // signed out here; a learner who signed up on the login page keeps their saved details.
    if (user && user.authSource !== 'firebase') return;
    readwyTeacherData = null;
    user = null;
    if (page === 'work' && ['dashboard','teacher-sections','reports'].includes(activeModule)) render();
    return;
  }
  if (user?.id !== authUser.uid) readwyTeacherData = null;
  user = {
    id: authUser.uid,
    authSource: 'firebase',
    name: profile.name || authUser.displayName || authUser.email || 'READwy user',
    email: authUser.email || profile.email || '',
    role: profile.role,
    grade: Number(profile.grade) || 7,
    section: profile.section || '',
    learningArea: profile.learningArea || '',
    teacherUid: profile.teacherUid || '',
    classCode: profile.classCode || '',
    lrn: profile.lrn || ''
  };
  if (READWY_TEACHER_GRADES.includes(user.grade)) selectedGrade = user.grade;
};

const readwyOriginalSave = save;
const readwyOriginalLoad = load;
const readwyStudentStorageKey = key => {
  if (user?.role !== 'student' || !user.id || !/^(assessment_|answer_|oral_|wst_|aral_|post_test_|post_result_)/.test(key)) return key;
  return `student_${user.id}_${key}`;
};
load = function(key, fallback) {
  return readwyOriginalLoad(readwyStudentStorageKey(String(key)), fallback);
};
let readwyCloudSyncTimer = null;
let readwyCloudSyncQueue = new Map();
save = function(key, value) {
  const keyString = String(key);
  readwyOriginalSave(readwyStudentStorageKey(keyString), value);
  if (user?.role !== 'student' || !/^(assessment_(7|8|9|10)|oral_(7|8|9|10)|wst_submission_(7|8|9|10)|wst_score_(7|8|9|10)|aral_responses_v2_(7|8|9|10)|aral_week1_sessions_(7|8|9|10)|aral_(7|8|9|10)|post_result_(7|8|9|10)|orst_attempts_v1_)/.test(keyString)) return;
  readwyCloudSyncQueue.set(keyString, value);
  clearTimeout(readwyCloudSyncTimer);
  readwyCloudSyncTimer = setTimeout(async () => {
    const queue = [...readwyCloudSyncQueue.entries()];
    readwyCloudSyncQueue.clear();
    try {
      const api = await window.readwyFirebaseReady;
      for (const [queuedKey, queuedValue] of queue) await api.syncLegacyRecord(queuedKey, queuedValue);
    } catch (error) {
      showPageStatus(`A learning record could not sync to your teacher: ${error.message || 'check your connection and sign in again.'}`);
    }
  }, 900);
};

window.readwySyncIntervention = store => window.readwyFirebaseReady
  .then(api => api.syncIntervention(store))
  .catch(error => showPageStatus(`Intervention progress could not sync: ${error.message || 'check your connection and sign in again.'}`));

document.addEventListener('input', event => {
  if (event.target.id === 'tpSearch') {
    readwyTeacherSearch = event.target.value;
    const start = event.target.selectionStart;
    readwyTPDrawView();
    const next = document.getElementById('tpSearch');
    next?.focus();
    next?.setSelectionRange(start, start);
  }
});
document.addEventListener('change', event => {
  if (event.target.name === 'grade' && event.target.form?.id === 'tpClassForm') {
    const sectionSelect = event.target.form.elements.section;
    if (sectionSelect) sectionSelect.innerHTML = readwyTPSectionOptions(event.target.value);
    return;
  }
  if (event.target.id === 'tpJourneyFilter') readwyTPDrawView();
  if (event.target.id === 'tpSectionPick') {
    readwyTeacherSectionKey = event.target.value;
    readwyTPDrawView();
    document.getElementById('tpSectionPick')?.focus();
  }
  if (event.target.id === 'tpSectionGrade') {
    readwyTeacherGradeView = event.target.value;
    readwyTPDrawView();
    document.getElementById('tpSectionGrade')?.focus();
  }
});
document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id === 'tpClassForm') {
    event.preventDefault();
    const status = document.getElementById('tpClassStatus');
    if (readwyTPIsPreview()) {
      const values = Object.fromEntries(new FormData(form));
      const grade = Number(values.grade);
      const section = String(values.section || '').trim();
      const list = readwyTPPreviewSections();
      if (!READWY_TEACHER_GRADES.includes(grade) || !readwyTPSectionsFor(grade).includes(section)) {
        if (status) status.textContent = 'Choose a grade and a section.';
        return;
      }
      if (list.some(item => readwyTPClassKey(item.grade, item.section) === readwyTPClassKey(grade, section) && item.learningArea === values.learningArea)) {
        if (status) status.textContent = `Grade ${grade} · ${section} (${values.learningArea}) is already one of your sections.`;
        return;
      }
      const slug = section.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const id = `preview-${grade}-${slug}-${String(values.learningArea).slice(0, 3).toLowerCase()}`;
      list.push({id, grade, section, learningArea: values.learningArea, active: true});
      if (values.enrolled) readwyTPSetClassSize(id, values.enrolled);
      if (!readwyTPSavePreviewSections(list)) {
        if (status) status.textContent = 'This browser could not save the section.';
        return;
      }
      readwyTeacherClassNotice = `Grade ${grade} · ${section} added to your handled sections (developer preview).`;
      readwyTPReload();
      return;
    }
    try {
      const api = await window.readwyFirebaseReady;
      const formValues = Object.fromEntries(new FormData(form));
      const code = await api.createClassroom(formValues);
      if (formValues.enrolled) readwyTPSetClassSize(code, formValues.enrolled);
      readwyTeacherClassNotice = `Class code created: ${code}. Share it only with learners in this grade, section, and learning area.`;
      if (status) status.textContent = readwyTeacherClassNotice;
      await readwyTPReload();
    } catch (error) {
      if (status) status.textContent = error.message || 'The class code could not be created.';
    }
  }
  if (form.id === 'tpInterventionForm') {
    event.preventDefault();
    const status = form.querySelector('[role="status"]');
    const values = Object.fromEntries(new FormData(form));
    values.studentUid = form.dataset.student;
    try {
      const api = await window.readwyFirebaseReady;
      await api.saveInterventionReport(values);
      readwyTeacherSelectedStudent = values.studentUid;
      readwyTeacherStudentTab = 'interventions';
      readwyTeacherInterventionDraft = false;
      await readwyTPReload();
    } catch (error) {
      if (status) status.textContent = error.message || 'The intervention report could not be saved.';
    }
  }
});
document.addEventListener('click', async event => {
  const pageButton = event.target.closest('[data-tp-page]');
  if (pageButton && !pageButton.disabled) {
    readwyTPNavigate(event, pageButton.dataset.tpPage);
    return;
  }
  const button = event.target.closest('[data-tp-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.tpAction;
  if (action === 'open-section') {
    readwyTeacherSectionKey = button.dataset.code || '';
    readwyTPAnimateNext = true;
    readwyRenderTeacherPortal(button.dataset.tpTarget || 'assessments');
    return;
  }
  if (action === 'overview') { readwyTeacherSelectedStudent = ''; readwyTPAnimateNext = true; readwyRenderTeacherPortal(readwyTeacherReturnView); }
  if (action === 'student') {
    if (readwyTeacherView !== 'student') readwyTeacherReturnView = readwyTeacherView;
    const uid = button.dataset.uid || '';
    if (uid !== readwyTeacherSelectedStudent) readwyTeacherStudentTab = 'journey';
    readwyTeacherInterventionDraft = false;
    readwyTeacherSelectedStudent = uid;
    readwyTPAnimateNext = true;
    readwyRenderTeacherPortal('student');
  }
  if (action === 'student-tab') {
    readwyTeacherStudentTab = ['journey', 'records', 'interventions'].includes(button.dataset.tab) ? button.dataset.tab : 'journey';
    readwyTeacherInterventionDraft = false;
    readwyTPDrawView();
    return;
  }
  if (action === 'cancel-intervention') {
    readwyTeacherInterventionDraft = false;
    readwyTPDrawView();
    return;
  }
  if (action === 'checks-tab') {
    readwyTeacherChecksTab = button.dataset.tab === 'records' ? 'records' : 'matrix';
    readwyTPDrawView();
    return;
  }
  if (action === 'open-add') {
    const details = app.querySelector('.tp-add-section');
    if (details) { details.open = true; details.querySelector('select')?.focus(); }
    return;
  }
  if (action === 'remove-preview-section' && readwyTPIsPreview()) {
    if (!confirm('Remove this section from your developer preview?')) return;
    readwyTPSavePreviewSections(readwyTPPreviewSections().filter(item => item.id !== button.dataset.code));
    readwyTPReload();
    return;
  }
  if (action === 'class-size') {
    const current = readwyTPClassSize(button.dataset.code);
    const answer = prompt('How many learners are enrolled in this section (from your class list)?', current ? String(current) : '');
    if (answer === null) return;
    readwyTPSetClassSize(button.dataset.code, answer);
    readwyTPDrawView();
    return;
  }
  if (action === 'refresh') readwyTPReload();
  if (action === 'print') window.print();
  if (action === 'export-class') readwyTPDownload('READwy_Teacher_Student_Records.csv', readwyTPClassRows());
  if (action === 'objectives') readwyTPDownload('READwy_Objective_Accomplishment_Report.csv', readwyTPBuildObjectiveClassRows());
  if (action === 'export-student') {
    const student = readwyTPStudent(readwyTeacherSelectedStudent);
    if (student) readwyTPDownload(`READwy_Objectives_${student.grade}_${student.section}.csv`, readwyTPObjectiveRows(student));
  }
  if (action === 'new-intervention') {
    const student = readwyTPStudent(readwyTeacherSelectedStudent);
    if (!student) return;
    readwyTeacherStudentTab = 'interventions';
    readwyTeacherInterventionDraft = true;
    readwyTPDrawView();
    app.querySelector('#tpInterventionForm input')?.focus();
  }
  if (action === 'export-intervention') {
    readwyTPDownload('READwy_Intervention_Report.csv', readwyTPBuildInterventionRows(readwyTeacherSelectedStudent));
  }
  if (action === 'copy-code') {
    try { await navigator.clipboard.writeText(button.dataset.code); button.textContent = 'Copied'; }
    catch { button.textContent = 'Copy unavailable'; }
  }
  if (action === 'deactivate-class') {
    if (!confirm('Deactivate this class code? Enrolled learners keep their records, but new sign-ups will be blocked.')) return;
    if (readwyTPIsPreview()) {
      readwyTPSavePreviewSections(readwyTPPreviewSections().map(item => item.id === button.dataset.code ? {...item, active: false} : item));
      readwyTPReload();
      return;
    }
    try {
      const api = await window.readwyFirebaseReady;
      await api.setClassroomActive(button.dataset.code, false);
      await readwyTPReload();
    } catch (error) {
      showPageStatus(error.message || 'The class code could not be deactivated.');
    }
  }
  if (action === 'signout') {
    if (window.readwyDeveloperTeacherPreview) {
      window.readwyDeveloperTeacherPreview = false;
      if (!readwyStartupTeacherPreviewActive) save('user', null);
      readwyTeacherData = null;
      user = null;
      try {
        sessionStorage.removeItem('READwy_current_view_v1');
        sessionStorage.removeItem('READWY_startup_teacher_preview');
        sessionStorage.removeItem('readwyJourneyOpened');
      } catch {}
      readwyStartupTeacherPreviewActive = false;
      location.href = 'index.html?view=train';
      return;
    }
    // Sign out first (shared school devices), then open the boarding pass (Student / Teacher).
    try { await (await window.readwyFirebaseReady).signOut(); }
    catch (error) { showPageStatus(error.message || 'Sign out failed.'); return; }
    readwyTeacherData = null;
    user = null;
    try {
      sessionStorage.removeItem('READwy_current_view_v1');
      sessionStorage.removeItem('readwyJourneyOpened');
    } catch {}
    location.href = 'index.html?view=train';
  }
});

function readwyActivateFirebaseAccounts() {
  if (renderSignup !== readwyFirebaseSignupWrapper) {
    const originalSignup = renderSignup;
    readwyFirebaseSignupWrapper = function(role = 'student') {
      originalSignup(role);
      if (role === 'teacher') {
        const panel = app.querySelector('.story-auth.story-register');
        if (panel) panel.innerHTML = `<p class="story-kicker">Teacher access</p><h1>Teacher sign up</h1><p>Teachers sign up on the READwy start screen with their DepEd email (@deped.gov.ph). Choose Teacher, then Sign up, and open the verification email before you sign in.</p><a class="story-enter" href="index.html?view=startup">Go to teacher sign up</a>`;
      }
    };
    renderSignup = readwyFirebaseSignupWrapper;
  }
  submitSignupForm = async function(event, role) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.signup-form-status');
    const button = form.querySelector('[type="submit"]');
    if (role !== 'student') {
      status.textContent = 'Teachers sign up on the READwy start screen with their DepEd email (@deped.gov.ph).';
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const value = name => String(form.elements[name]?.value || '').trim();
    if (!/^\d{12}$/.test(value('signupLrn'))) {
      status.textContent = 'LRN must contain exactly 12 digits.';
      form.elements.signupLrn?.focus();
      return;
    }
    const name = [value('signupFirstName'), value('signupMiddleInitial'), value('signupLastName')].filter(Boolean).join(' ');
    const fields = {
      name,
      email: value('signupEmail'),
      password: value('signupPassword'),
      lrn: value('signupLrn'),
      grade: Number(value('signupGrade')),
      section: value('signupSection'),
      learningArea: value('signupLearningArea'),
      classCode: value('signupClassCode')
    };
    if (button) button.disabled = true;
    status.textContent = 'Creating your account and joining your teacher’s class…';
    try {
      const api = await window.readwyFirebaseReady;
      await api.signUpStudent(fields);
      status.textContent = 'Account created. Welcome to READwy!';
      go('map');
    } catch (error) {
      status.textContent = error.message || 'Account creation failed. Check your details and try again.';
      if (button) button.disabled = false;
    }
  };
  demoLogin = async function(event) {
    event.preventDefault();
    if (!['student','teacher'].includes(authRole)) {
      setLoginStatus('Choose Student or Teacher first.');
      return;
    }
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) {
      setLoginStatus('Enter both your email and password.');
      return;
    }
    setLoginStatus('Signing in…');
    try {
      const api = await window.readwyFirebaseReady;
      const result = await api.signIn(email, password, authRole);
      setLoginStatus('');
      if (result.profile.role === 'teacher') readwyRenderTeacherPortal('dashboard');
      else go('map');
    } catch (error) {
      setLoginStatus(error.message || 'Sign-in failed. Check your email and password.');
    }
  };
  requestDemoReset = async function() {
    const email = document.getElementById('loginEmail')?.value.trim();
    if (!email) {
      setLoginStatus('Enter the email address for your account first.');
      document.getElementById('loginEmail')?.focus();
      return;
    }
    setLoginStatus('Sending password-reset email…');
    try {
      const api = await window.readwyFirebaseReady;
      await api.sendPasswordResetEmail(email);
      setLoginStatus('If this email has a READwy account, Firebase will send password-reset instructions.');
    } catch (error) {
      setLoginStatus(error.message || 'Password reset is unavailable. Contact the READwy administrator.');
    }
  };
  readwyTeacherSections = readwyRenderTeacherPortal;
  if (modulePage !== readwyFirebaseModuleWrapper) {
    const originalModulePage = modulePage;
    readwyFirebaseModuleWrapper = function(mod) {
      if (user?.role === 'teacher' && ['dashboard','reports','teacher-sections'].includes(mod)) {
        return readwyRenderTeacherPortal();
      }
      return originalModulePage(mod);
    };
    modulePage = readwyFirebaseModuleWrapper;
  }
  if (renderToolbar !== readwyFirebaseToolbarWrapper) {
    const originalToolbar = renderToolbar;
    readwyFirebaseToolbarWrapper = function() {
      originalToolbar();
      const toolbar = document.getElementById('nav');
      if (toolbar) toolbar.style.display =
        user?.role === 'teacher' && page === 'work' && activeModule === 'dashboard' ? 'none' : '';
    };
    renderToolbar = readwyFirebaseToolbarWrapper;
  }
  if (openModule !== readwyGradeAccessWrapper) {
    const originalOpenModule = openModule;
    readwyGradeAccessWrapper = function(mod) {
      const grade = Number(user?.grade);
      if (user?.role === 'student' && [11, 12].includes(grade) && !['interv', 'sra'].includes(mod)) {
        showPageStatus(`For Grade ${grade}, the available digital learning journeys are Intervention and Reading Lab. Other assessment tools are currently prepared for Grades 7–10.`);
        return;
      }
      return originalOpenModule(mod);
    };
    openModule = readwyGradeAccessWrapper;
  }
  const teacherPreviewRoute = new URLSearchParams(location.search).get('view') === 'teacher-preview';
  let startupTeacherPreview = false;
  if (teacherPreviewRoute) {
    try {
      // Kept for this browser tab (until Sign out) so a reload of the preview stays in the teacher portal.
      startupTeacherPreview = sessionStorage.getItem('READWY_startup_teacher_preview') === '1';
    } catch (error) {
      console.error('Unable to read the temporary startup teacher preview state.', error);
    }
  }
  // The one-time flag is consumed on the first pass. If the app's own start-up render then paints over
  // the portal before the page finishes loading, the second pass (on load) must still restore it.
  if (startupTeacherPreview) readwyStartupTeacherPreviewActive = true;
  if (teacherPreviewRoute && readwyStartupTeacherPreviewActive) {
    if (document.querySelector('.teacher-portal') && user?.role === 'teacher') return;
    window.readwyDeveloperTeacherPreview = true;
    user = {
      id: 'readwy-dev-teacher',
      role: 'teacher',
      dev: true,
      name: 'Developer Teacher',
      firstName: 'Developer',
      grade: 7,
      sections: [{grade: 7, section: 'A'}],
      learningArea: 'English',
      email: 'developer.teacher@readwy.local'
    };
    readwyTeacherData = {classrooms: [], roster: [], records: [], interventions: []};
    readwyRenderTeacherPortal('dashboard');
  } else if (teacherPreviewRoute) {
    const previewUser = load('user', null);
    if (previewUser?.role === 'teacher') {
      if (previewUser.dev === true) {
        window.readwyDeveloperTeacherPreview = true;
        user = {...previewUser, id: previewUser.id || 'readwy-dev-teacher'};
        readwyTeacherData = {classrooms: [], roster: [], records: [], interventions: []};
      } else {
        window.readwyDeveloperTeacherPreview = false;
        user = {...previewUser, id: previewUser.id || user?.id};
        readwyTeacherData = null;
      }
      readwyRenderTeacherPortal('dashboard');
    }
  }
}
readwyActivateFirebaseAccounts();
if (document.readyState !== 'complete') window.addEventListener('load', readwyActivateFirebaseAccounts, {once:true});
