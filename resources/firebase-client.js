import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
  pipelines,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore-pipelines.js';

const app = initializeApp({
  apiKey: 'AIzaSyADjYOGoVAoFR6IkTbP_U2D_RYMpZeIrFI',
  authDomain: 'readwy-bda35.firebaseapp.com',
  projectId: 'readwy-bda35',
  appId: '1:369867582254:web:cb7255d13805be0ee2a8bf',
  messagingSenderId: '369867582254'
});
const auth = getAuth(app);
const db = getFirestore(app, 'readwy-records');
let currentProfile = null;
let provisioningUid = null;
const recordFingerprints = new Map();

const allowedAreas = ['English', 'Filipino', 'Mathematics'];
const normalize = value => String(value ?? '').trim();
const dateString = value => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : new Date();
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
};
const finite = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const digest = async value => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
};
const compact = value => JSON.stringify(value).slice(0, 11980);

function assertStudentProfile(profile) {
  if (!profile || profile.role !== 'student' || !profile.teacherUid) {
    throw new Error('Student account is not enrolled in a teacher’s class.');
  }
}

function scoreFields(score, total, percent) {
  if (!finite(score) || !finite(total) || Number(total) <= 0) return {};
  const value = Number(score), outOf = Number(total);
  if (value < 0 || value > outOf || outOf > 1000) return {};
  return {
    score: value,
    total: outOf,
    scorePercent: finite(percent) ? Math.min(100, Math.max(0, Number(percent))) : value * 100 / outOf
  };
}

function reportEvent(journey, recordKey, title, status, objectiveReport, details, completedAt, score, total, percent) {
  const profile = currentProfile;
  assertStudentProfile(profile);
  const fields = scoreFields(score, total, percent);
  return {
    studentUid: auth.currentUser.uid,
    teacherUid: profile.teacherUid,
    grade: Number(profile.grade),
    section: normalize(profile.section),
    learningArea: profile.learningArea,
    journey,
    recordKey: normalize(recordKey).slice(0, 160),
    title: normalize(title).slice(0, 120) || journey,
    status: status === 'submitted' ? 'submitted' : 'awaiting-review',
    completedAt: Timestamp.fromDate(new Date(dateString(completedAt))),
    objectiveReport: normalize(objectiveReport).slice(0, 2000) || 'No objective-level result was recorded.',
    details: compact(details || {}),
    ...fields
  };
}

function recordsFromLocalKey(key, value) {
  const gradeMatch = String(key).match(/_(7|8|9|10)$/);
  const grade = Number(gradeMatch?.[1] || currentProfile?.grade);
  const rows = [];
  if (!value || typeof value !== 'object') return rows;

  if (/^assessment_(7|8|9|10)$/.test(key) && finite(value.score) && finite(value.total) && Number(value.total) > 0) {
    const percent = finite(value.percentage) ? value.percentage : 100 * value.score / value.total;
    rows.push(reportEvent(
      'GST', 'gst-score', `Keypass score · Grade ${grade}`, 'completed',
      `Overall result: ${value.score}/${value.total} (${percent.toFixed(1)}%). The digital result does not provide verified objective-category scores; no literal, inferential, or critical breakdown is inferred.`,
      { score: value.score, total: value.total, percent, answered: value.answered, elapsedMs: value.elapsedMs, answerKeyVersion: value.answerKeyVersion, keyNote: 'Passage-reviewed classroom key; not an official published answer key.' },
      value.completedAt || value.submittedAt || value.date, value.score, value.total, percent
    ));
  }

  if (/^post_result_(7|8|9|10)$/.test(key)) {
    (Array.isArray(value.runs) ? value.runs : []).forEach((run, index) => {
      if (!finite(run.score) || !finite(run.total) || Number(run.total) <= 0) return;
      const percent = finite(run.pct) ? run.pct : 100 * run.score / run.total;
      rows.push(reportEvent(
        'Post-Test', `post-${run.level || grade}-${index}`, `Post-test · Grade ${run.level || grade} · ${run.title || 'Reading passage'}`,
        'completed',
        `Comprehension result: ${run.score}/${run.total} (${percent}%), ${run.band || 'level not recorded'}. This post-test uses a proposed key that requires teacher verification; treat the result as provisional.`,
        { level: run.level, score: run.score, total: run.total, percent, band: run.band, seconds: run.secs, wordsPerMinute: run.wpm, keyVerified: false },
        run.date || value.date, run.score, run.total, percent
      ));
    });
  }

  if (/^oral_(7|8|9|10)$/.test(key)) {
    const words = Number(value.words), miscues = Number(value.miscues);
    const accuracy = finite(value.accuracy) ? Number(value.accuracy) :
      (words > 0 && miscues >= 0 && miscues <= words ? 100 * (words - miscues) / words : null);
    const comprehension = finite(value.comprehension) ? Number(value.comprehension) : null;
    if (accuracy === null && comprehension === null && !value.readingLevel && !value.level) return rows;
    const parts = [];
    if (accuracy !== null) parts.push(`Word accuracy: ${accuracy.toFixed(1)}%`);
    if (comprehension !== null) parts.push(`Comprehension: ${comprehension.toFixed(1)}%`);
    if (value.readingLevel || value.level) parts.push(`Reading profile: ${value.readingLevel || value.level}`);
    rows.push(reportEvent(
      'ORST', 'oral-reading-summary', `Voice Station · Grade ${grade}`, 'completed',
      parts.join('. ') || 'Oral reading record saved; no score is available.',
      { words: finite(words) ? words : null, miscues: finite(miscues) ? miscues : null, accuracy, comprehension, readingLevel: value.readingLevel || value.level || null, passage: value.title || null, teacherObserved: !!value.teacherValidated },
      value.completedAt || value.date, accuracy === null ? undefined : accuracy, accuracy === null ? undefined : 100, accuracy
    ));
  }

  if (String(key).startsWith('orst_attempts_v1_') && Array.isArray(value)) {
    value.forEach((attempt, index) => {
      if (!attempt || !finite(attempt.correct) || !finite(attempt.total) || Number(attempt.total) <= 0) return;
      const comprehension = finite(attempt.comprehension)
        ? Number(attempt.comprehension)
        : 100 * Number(attempt.correct) / Number(attempt.total);
      const accuracy = finite(attempt.accuracy) ? Number(attempt.accuracy) : null;
      const passage = Number.isInteger(attempt.passageIndex) ? attempt.passageIndex + 1 : index + 1;
      const measures = [`Comprehension: ${comprehension.toFixed(1)}%`];
      if (accuracy !== null) measures.unshift(`Oral reading accuracy: ${accuracy.toFixed(1)}%`);
      if (attempt.level) measures.push(`Reading profile: ${attempt.level}`);
      rows.push(reportEvent(
        'ORST', `passage-${passage}-${attempt.completedAt || index}`,
        `Voice Station · Passage ${passage} · ${attempt.title || 'Reading passage'}`, 'completed',
        `${measures.join('. ')}. Review automatic counts and answer scoring with the teacher.`,
        { passage, words: attempt.words, miscues: attempt.miscues, accuracy, correct: attempt.correct, questions: attempt.total, comprehension, profile: attempt.level || null, teacherObserved: !!attempt.teacherValidated },
        attempt.completedAt, attempt.correct, attempt.total, comprehension
      ));
    });
  }

  if (/^wst_submission_(7|8|9|10)$/.test(key) && typeof value.text === 'string' && value.text) {
    const reviewed = value.reviewed === true && finite(value.score) && finite(value.total);
    const percent = reviewed ? 100 * value.score / value.total : null;
    rows.push(reportEvent(
      'WST', 'writing-submission', `Spellscript writing · Grade ${grade}`, reviewed ? 'completed' : 'awaiting-review',
      reviewed
        ? `Writing score: ${value.score}/${value.total} (${percent.toFixed(1)}%).`
        : `Writing submitted (${Number(value.words) || value.text.trim().split(/\s+/).length} words); waiting for teacher scoring. No score was generated.`,
      { words: Number(value.words) || value.text.trim().split(/\s+/).length, submitted: true, score: reviewed ? value.score : null, total: reviewed ? value.total : null, components: value.components || null },
      value.date || value.submittedAt, reviewed ? value.score : undefined, reviewed ? value.total : undefined, percent
    ));
  }

  if (/^wst_score_(7|8|9|10)$/.test(key) && finite(value.score) && finite(value.total) && Number(value.total) > 0) {
    const percent = 100 * Number(value.score) / Number(value.total);
    rows.push(reportEvent(
      'WST', 'writing-score', `Spellscript score · Grade ${grade}`, 'completed',
      `Teacher-recorded writing score: ${value.score}/${value.total} (${percent.toFixed(1)}%).`,
      { score: value.score, total: value.total, percent, components: value.components || null },
      value.date || value.completedAt, value.score, value.total, percent
    ));
  }

  if (/^aral_responses_v2_(7|8|9|10)$/.test(key)) {
    for (const [week, record] of Object.entries(value)) {
      const task = record?.task1;
      if (!task?.complete) continue;
      const responses = Array.isArray(task.rounds) ? task.rounds.reduce((sum, round) => sum + (round?.answers?.length || 0), 0) : 0;
      rows.push(reportEvent(
        'ARAL', `week-${week}-association`, `Catch-Up Express · Week ${week} · Word association`, 'completed',
        `The four word-association rounds were submitted. ${responses} responses were saved; this is a completion record, not an automatic mastery score.`,
        { week: Number(week), objective: 'Generate associated words from given prompts', roundsCompleted: 4, responses },
        task.submittedAt, undefined, undefined, undefined
      ));
    }
  }

  if (/^aral_week1_sessions_(7|8|9|10)$/.test(key)) {
    for (const [session, activities] of Object.entries(value)) {
      if (!activities || typeof activities !== 'object') continue;
      const submitted = Object.values(activities).filter(activity => activity?.submitted);
      if (!submitted.length) continue;
      rows.push(reportEvent(
        'ARAL', `week-1-session-${session}`, `Catch-Up Express · Week 1 · Session ${session}`, 'submitted',
        `${submitted.length} submitted activity record${submitted.length === 1 ? '' : 's'}; teacher review is still needed to determine mastery.`,
        { week: 1, session: Number(session), activitiesSubmitted: submitted.length, completion: true },
        submitted.map(item => item.submittedAt).filter(Boolean).sort().pop(), undefined, undefined, undefined
      ));
    }
  }

  if (/^aral_(7|8|9|10)$/.test(key)) {
    for (const [week, record] of Object.entries(value)) {
      if (!record?.status) continue;
      rows.push(reportEvent(
        'ARAL', `weekly-review-${week}`, `Catch-Up Express · Week ${week} · Teacher review`, 'completed',
        `Recorded mastery status: ${record.status}.`,
        { week: Number(week), teacherStatus: String(record.status).slice(0, 80) },
        record.date, undefined, undefined, undefined
      ));
    }
  }
  return rows;
}

async function writeStudentRecord(record) {
  const uid = auth.currentUser?.uid;
  if (!uid || record.studentUid !== uid) throw new Error('Your signed-in student account could not be verified for record sync.');
  const key = `${uid}|${record.journey}|${record.recordKey}`;
  const id = await digest(key);
  const fingerprint = JSON.stringify({ ...record, completedAt: undefined });
  if (recordFingerprints.get(id) === fingerprint) return;
  const ref = doc(db, 'studentRecords', id);
  await runTransaction(db, async transaction => {
    const existing = await transaction.get(ref);
    transaction.set(ref, {
      ...record,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  recordFingerprints.set(id, fingerprint);
}

async function syncLegacyRecord(key, value) {
  if (currentProfile?.role !== 'student') return;
  if (!currentProfile.teacherUid) throw new Error('Your student account is not enrolled in a teacher’s class.');
  const rows = recordsFromLocalKey(key, value);
  for (const row of rows) await writeStudentRecord(row);
}

async function syncIntervention(store) {
  if (currentProfile?.role !== 'student' || !currentProfile.teacherUid) return;
  const grade = Number(currentProfile.grade);
  const byGrade = store?.st?.[grade];
  if (!byGrade) return;
  const stationNames = { fl: 'Fluency', vo: 'Vocabulary', co: 'Comprehension', in: 'Inference', cr: 'Critical reading and writing' };
  const stations = Object.entries(stationNames).map(([key, name]) => {
    const tasks = byGrade[key]?.t || {};
    let completed = 0, points = 0;
    for (let task = 1; task <= 5; task++) {
      const result = tasks[task];
      if (result?.g?.won && result?.w) completed++;
      points += Number(result?.pts) || 0;
    }
    return { name, tasksCompleted: completed, tasksAvailable: 5, points };
  });
  const completed = stations.reduce((sum, station) => sum + station.tasksCompleted, 0);
  if (!completed) return;
  const details = { activitiesCompleted: completed, activitiesAvailable: 25, stations };
  const objectiveReport = stations.map(station => `${station.name}: ${station.tasksCompleted}/${station.tasksAvailable} tasks completed`).join('. ');
  const record = reportEvent(
    'Intervention', 'interv-station-progress', 'Inkventure station progress', 'submitted',
    `${completed}/25 station tasks completed. Completion and points are progress indicators, not a reading mastery diagnosis. ${objectiveReport}.`,
    details, new Date().toISOString(), undefined, undefined, undefined
  );
  await writeStudentRecord(record);
}

function randomClassCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function signUpStudent(values) {
  const credential = await createUserWithEmailAndPassword(auth, normalize(values.email).toLowerCase(), values.password);
  provisioningUid = credential.user.uid;
  try {
    const classCode = await resolveClassCode(values.classCode);
    const classSnapshot = await getDoc(doc(db, 'classrooms', classCode));
    if (!classSnapshot.exists()) throw new Error('That class code was not found. Ask your teacher for the current code.');
    const classroom = classSnapshot.data();
    if (!classroom.active || classroom.grade !== Number(values.grade) ||
      classroom.section.trim().toLowerCase() !== normalize(values.section).toLowerCase() ||
      (values.learningArea && classroom.learningArea !== values.learningArea)) {
      throw new Error('Grade, section, or learning area does not match the class code. Check with your teacher.');
    }
    const profile = {
      uid: credential.user.uid,
      name: normalize(values.name),
      email: credential.user.email,
      role: 'student',
      lrn: normalize(values.lrn),
      grade: Number(values.grade),
      section: classroom.section,
      learningArea: classroom.learningArea,
      teacherUid: classroom.teacherUid,
      classCode,
      createdAt: serverTimestamp()
    };
    const roster = {
      uid: credential.user.uid,
      teacherUid: classroom.teacherUid,
      classCode,
      name: profile.name,
      lrn: profile.lrn,
      grade: profile.grade,
      section: profile.section,
      learningArea: profile.learningArea,
      createdAt: serverTimestamp()
    };
    const batch = writeBatch(db);
    batch.set(doc(db, 'profiles', credential.user.uid), profile);
    batch.set(doc(db, 'studentRoster', credential.user.uid), roster);
    await batch.commit();
    currentProfile = { ...profile, createdAt: undefined };
    window.readwySetFirebaseSession?.(credential.user, currentProfile);
    return { uid: credential.user.uid, profile: currentProfile };
  } catch (error) {
    currentProfile = null;
    if (auth.currentUser?.uid === credential.user.uid) {
      try { await deleteUser(credential.user); }
      catch { throw new Error(`${error.message} Your sign-up could not be rolled back; contact the READwy administrator before retrying.`); }
    }
    throw error;
  } finally {
    provisioningUid = null;
  }
}

/* Teacher self sign-up (verified @deped.gov.ph emails only, enforced again by firestore.rules).
   The start screen's sign-up keeps the teacher's name, subject area and sections in this browser;
   on the first verified sign-in the teacher profile is created, then one class per chosen section. */
const TEACHER_EMAIL = /^[a-z0-9._%+-]+@deped\.gov\.ph$/;
const isDepEdEmail = email => TEACHER_EMAIL.test(normalize(email).toLowerCase());
function localTeacherSignup(email, chosen) {
  try {
    const profiles = JSON.parse(localStorage.getItem('READwy_new_2026_local_studentProfiles') || '{}');
    const saved = profiles[normalize(email).toLowerCase()];
    if (saved?.role === 'teacher') return saved;
    if (saved?.role) return null; // signed up as a student
  } catch {}
  try { if (chosen || localStorage.getItem('readwySelectedRole') === 'teacher') return {}; } catch {}
  return chosen ? {} : null;
}
const teacherSignupMessage = 'Teacher accounts need a DepEd email (@deped.gov.ph). Sign up again with your DepEd email, then verify it from your inbox.';
async function provisionTeacher(authUser, chosen = false) {
  if (!authUser || !isDepEdEmail(authUser.email)) return null;
  const local = localTeacherSignup(authUser.email, chosen);
  if (!local) return null;
  if (!authUser.emailVerified) throw new Error('Open the verification email sent to your DepEd address first, then sign in again.');
  const name = normalize(local.name || [local.firstName, local.middleInitial, local.lastName].filter(Boolean).join(' ') ||
    authUser.displayName || authUser.email.split('@')[0]).slice(0, 100);
  const profile = { uid: authUser.uid, name, email: authUser.email, role: 'teacher', createdAt: serverTimestamp() };
  if (allowedAreas.includes(local.learningArea)) profile.learningArea = local.learningArea;
  await setDoc(doc(db, 'profiles', authUser.uid), profile);
  currentProfile = { ...profile, createdAt: undefined };
  const sections = (Array.isArray(local.sections) ? local.sections : []).filter(s => s && s.grade && s.section).slice(0, 30);
  if (profile.learningArea) {
    for (const s of sections) {
      try { await createClassroom({ grade: s.grade, section: s.section, learningArea: profile.learningArea, joinCode: s.code || '' }); }
      catch (error) {
        // The code was taken in the meantime: keep the section; the teacher sets a new code on the dashboard.
        if (error?.code === 'code-taken') {
          try { await createClassroom({ grade: s.grade, section: s.section, learningArea: profile.learningArea }); } catch {}
          window.readwyJoinCodeNotice = `The code ${s.code} was already in use, so Grade ${s.grade} · ${s.section} has no code yet. Set a new one on your Sections page.`;
        } else console.warn('READwy: could not create the class for', s, error);
      }
    }
  }
  return currentProfile;
}

/* Student sign-up on the start screen keeps the class code in this browser; on the first sign-in the student's
   profile and roster entry are created from that class (grade, section, teacher), so the teacher sees them. */
function localStudentSignup(email) {
  const key = normalize(email).toLowerCase();
  try {
    const profiles = JSON.parse(localStorage.getItem('READwy_new_2026_local_studentProfiles') || '{}');
    const pending = JSON.parse(localStorage.getItem('READwy_new_2026_local_pending_class_codes') || '{}');
    const saved = profiles[key];
    if (saved && saved.role && saved.role !== 'student') return null;
    const classCode = normalize(pending[key] || saved?.classCode || '');
    return classCode ? { ...(saved || {}), classCode } : null;
  } catch { return null; }
}
async function provisionStudent(authUser) {
  if (!authUser?.email) return null;
  const local = localStudentSignup(authUser.email);
  if (!local) return null;
  const lrn = normalize(local.lrn).replace(/\D/g, '');
  if (!/^\d{12}$/.test(lrn)) return null;
  const classCode = await resolveClassCode(local.classCode);
  const classSnapshot = await getDoc(doc(db, 'classrooms', classCode));
  if (!classSnapshot.exists()) throw new Error('That class code was not found. Ask your teacher for the current code.');
  const classroom = classSnapshot.data();
  if (!classroom.active) throw new Error('This class is not accepting new students right now. Ask your teacher.');
  const name = normalize(local.name || [local.firstName, local.middleInitial, local.lastName].filter(Boolean).join(' ') || authUser.displayName || authUser.email.split('@')[0]).slice(0, 100);
  const profile = { uid: authUser.uid, name, email: authUser.email, role: 'student', lrn, grade: classroom.grade, section: classroom.section,
    learningArea: classroom.learningArea, teacherUid: classroom.teacherUid, classCode, createdAt: serverTimestamp() };
  const roster = { uid: authUser.uid, teacherUid: classroom.teacherUid, classCode, name, lrn, grade: classroom.grade, section: classroom.section,
    learningArea: classroom.learningArea, createdAt: serverTimestamp() };
  const batch = writeBatch(db);
  batch.set(doc(db, 'profiles', authUser.uid), profile);
  batch.set(doc(db, 'studentRoster', authUser.uid), roster);
  await batch.commit();
  try { const k = 'READwy_new_2026_local_pending_class_codes', p = JSON.parse(localStorage.getItem(k) || '{}'); delete p[normalize(authUser.email).toLowerCase()]; localStorage.setItem(k, JSON.stringify(p)); } catch {}
  currentProfile = { ...profile, createdAt: undefined };
  return currentProfile;
}

async function signIn(email, password, expectedRole) {
  const credential = await signInWithEmailAndPassword(auth, normalize(email).toLowerCase(), password);
  try {
    let snapshot = await getDoc(doc(db, 'profiles', credential.user.uid));
    if (!snapshot.exists() && expectedRole === 'teacher') {
      if (!isDepEdEmail(credential.user.email)) throw new Error(teacherSignupMessage);
      await provisionTeacher(credential.user, true);
      snapshot = await getDoc(doc(db, 'profiles', credential.user.uid));
    }
    if (!snapshot.exists() && expectedRole === 'student' && await provisionStudent(credential.user)) {
      snapshot = await getDoc(doc(db, 'profiles', credential.user.uid));
    }
    if (!snapshot.exists()) throw new Error('This account is not activated for READwy yet. Ask the school administrator to provision it.');
    const profile = snapshot.data();
    if (profile.role !== expectedRole) throw new Error(`This account is registered as ${profile.role}. Choose the matching account type.`);
    currentProfile = profile;
    window.readwySetFirebaseSession?.(credential.user, profile);
    return { uid: credential.user.uid, profile, authUser: credential.user };
  } catch (error) {
    await signOut(auth);
    currentProfile = null;
    throw error;
  }
}

async function loadTeacherData() {
  const uid = auth.currentUser?.uid;
  if (!uid || currentProfile?.role !== 'teacher') throw new Error('Sign in with an activated teacher account to view student records.');
  const byTeacher = async collectionName => {
    const snapshot = await pipelines.execute(
      db.pipeline().collection(collectionName)
        .where(pipelines.field('teacherUid').equal(uid))
    );
    return snapshot.results.map(result => ({ id: result.id, ...result.data() }));
  };
  const [roster, records, interventions, classrooms, progress] = await Promise.all([
    byTeacher('studentRoster'),
    byTeacher('studentRecords'),
    byTeacher('interventionReports'),
    byTeacher('classrooms'),
    // Quest progress (Main Quest %, points). Older databases without it simply show no quest data.
    byTeacher('studentProgress').catch(() => [])
  ]);
  return { roster, records, interventions, classrooms, progress };
}

async function createClassroom(values) {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) throw new Error('Only an activated teacher can create a class code.');
  const grade = Number(values.grade), section = normalize(values.section);
  const learningArea = normalize(values.learningArea || currentProfile.learningArea);
  if (![7, 8, 9, 10, 11, 12].includes(grade) || !section || !allowedAreas.includes(learningArea)) {
    throw new Error('Choose a grade from 7–12, a section, and a learning area.');
  }
  if (currentProfile.learningArea && currentProfile.learningArea !== learningArea) {
    throw new Error('Choose your administrator-assigned learning area.');
  }
  const code = randomClassCode();
  const classroom = {
    teacherUid: auth.currentUser.uid,
    grade,
    section,
    learningArea,
    active: true,
    createdAt: serverTimestamp()
  };
  // A new section starts with the post-test date the teacher already set for their other sections.
  const current = await teacherPostTestDate().catch(() => null);
  if (current) Object.assign(classroom, { postTestDate: current, postTestDateSetBy: auth.currentUser.uid, postTestDateUpdatedAt: serverTimestamp() });
  const joinCode = values.joinCode ? normalizeJoinCode(values.joinCode) : '';
  if (values.joinCode && !JOIN_CODE.test(joinCode)) throw new Error('A class code has 4–10 letters or numbers, with no spaces.');
  if (!joinCode) { await setDoc(doc(db, 'classrooms', code), classroom); return code; }
  // The section and its code are saved together, so two sections can never get the same code.
  await runTransaction(db, async transaction => {
    const codeRef = doc(db, 'joinCodes', joinCode);
    if ((await transaction.get(codeRef)).exists()) throw codeTakenError(joinCode);
    transaction.set(doc(db, 'classrooms', code), { ...classroom, joinCode });
    transaction.set(codeRef, { classCode: code, teacherUid: auth.currentUser.uid, grade, section, createdAt: serverTimestamp() });
  });
  return code;
}

async function setClassroomActive(code, active) {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) throw new Error('Teacher access is required.');
  await updateDoc(doc(db, 'classrooms', code), { active: !!active, updatedAt: serverTimestamp() });
}

/* ---------- Class codes chosen by the teacher (one per section, unique across READwy) ---------- */
const JOIN_CODE = /^[A-Z0-9]{4,10}$/;
const normalizeJoinCode = value => normalize(value).toUpperCase().replace(/\s+/g, '');
function codeTakenError(code) { const e = new Error(`The code ${code} is already in use. Try another.`); e.code = 'code-taken'; return e }
// Set or change a section's code. The old code stops working at once; learners already in the section stay.
async function setJoinCode(classCode, value) {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) throw new Error('Teacher access is required.');
  const code = normalizeJoinCode(value);
  if (!JOIN_CODE.test(code)) throw new Error('A class code has 4–10 letters or numbers, with no spaces.');
  await runTransaction(db, async transaction => {
    const classRef = doc(db, 'classrooms', classCode), codeRef = doc(db, 'joinCodes', code);
    const room = await transaction.get(classRef), taken = await transaction.get(codeRef);
    if (!room.exists() || room.data().teacherUid !== auth.currentUser.uid) throw new Error('That section is not one of yours.');
    const old = room.data().joinCode || '';
    if (old === code) return;
    if (taken.exists()) throw codeTakenError(code);
    transaction.update(classRef, { joinCode: code, updatedAt: serverTimestamp() });
    transaction.set(codeRef, { classCode, teacherUid: auth.currentUser.uid, grade: room.data().grade, section: room.data().section, createdAt: serverTimestamp() });
    if (old) transaction.delete(doc(db, 'joinCodes', old));
  });
  return code;
}
// A learner's class code may be the teacher's short code or the older long code.
async function resolveClassCode(value) {
  const raw = normalize(value);
  if (/^[a-f0-9]{24}$/i.test(raw)) return raw.toLowerCase();
  const code = normalizeJoinCode(raw);
  if (!JOIN_CODE.test(code)) return raw.toLowerCase();
  const snapshot = await getDoc(doc(db, 'joinCodes', code)).catch(() => null);
  return snapshot?.exists() ? snapshot.data().classCode : raw.toLowerCase();
}

/* ---------- Post-test date (teacher sets one date for all of their sections) ---------- */
async function teacherClassrooms() {
  const snapshot = await getDocs(query(collection(db, 'classrooms'), where('teacherUid', '==', auth.currentUser.uid)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}
const millisOf = value => (value && typeof value.toMillis === 'function') ? value.toMillis() : 0;
async function teacherPostTestDate() {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) return null;
  const latest = (await teacherClassrooms()).filter(item => item.postTestDateUpdatedAt)
    .sort((a, b) => millisOf(b.postTestDateUpdatedAt) - millisOf(a.postTestDateUpdatedAt))[0];
  return latest?.postTestDate || null;
}
// date: "YYYY-MM-DD", or null to clear it. Returns the sections that were updated.
async function setPostTestDate(date) {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) throw new Error('Teacher access is required.');
  if (date !== null && !/^20\d{2}-[01]\d-[0-3]\d$/.test(String(date))) throw new Error('Choose a valid date.');
  const classes = await teacherClassrooms();
  if (!classes.length) throw new Error('Add a section first.');
  const batch = writeBatch(db);
  for (const item of classes) {
    batch.update(doc(db, 'classrooms', item.id), {
      postTestDate: date, postTestDateSetBy: auth.currentUser.uid,
      postTestDateUpdatedAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
  }
  await batch.commit();
  return classes.map(item => ({ id: item.id, grade: item.grade, section: item.section }));
}
// Learner: follow their section's post-test date live. cb({postTestDate}) on every change; returns stop().
function watchSectionPostTestDate(cb) {
  if (currentProfile?.role !== 'student' || !currentProfile.classCode) return () => {};
  return onSnapshot(doc(db, 'classrooms', currentProfile.classCode),
    snapshot => cb({ postTestDate: snapshot.exists() ? (snapshot.data().postTestDate || null) : null }),
    () => {});
}

/* ---------- Quests, points and badges (learner) ---------- */
// summary: totals and status; awards: [{key, amount, reason, localAt}] not yet saved. Returns the keys now saved.
async function saveQuestProgress(summary, awards = []) {
  const uid = auth.currentUser?.uid;
  if (currentProfile?.role !== 'student' || !uid || !currentProfile.teacherUid) return [];
  const saved = [];
  for (const award of awards.slice(0, 120)) {
    const key = String(award.key).replace(/\//g, '|').slice(0, 160);
    try {
      await setDoc(doc(db, 'studentProgress', uid, 'points', key), {
        key, amount: Math.max(0, Math.round(Number(award.amount) || 0)), reason: String(award.reason || 'Points').slice(0, 160),
        at: serverTimestamp(), localAt: String(award.localAt || '')
      });
      saved.push(award.key);
    } catch (error) {
      // Already saved from another device (awards can never be changed): count it as saved.
      if (error?.code === 'permission-denied') {
        const existing = await getDoc(doc(db, 'studentProgress', uid, 'points', key)).catch(() => null);
        if (existing?.exists()) saved.push(award.key);
      }
    }
  }
  await setDoc(doc(db, 'studentProgress', uid), {
    ...summary,
    studentUid: uid, teacherUid: currentProfile.teacherUid,
    grade: Number(currentProfile.grade), section: currentProfile.section,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return saved;
}
// Awards saved from any device, so a learner keeps their points on a new phone or computer.
async function loadQuestAwards() {
  const uid = auth.currentUser?.uid;
  if (currentProfile?.role !== 'student' || !uid) return [];
  const snapshot = await getDocs(collection(db, 'studentProgress', uid, 'points'));
  return snapshot.docs.map(item => item.data());
}

async function saveInterventionReport(values, reportId) {
  if (currentProfile?.role !== 'teacher' || !auth.currentUser) throw new Error('Teacher access is required.');
  const rosterSnapshot = await getDoc(doc(db, 'studentRoster', values.studentUid));
  if (!rosterSnapshot.exists() || rosterSnapshot.data().teacherUid !== auth.currentUser.uid) {
    throw new Error('That learner is not in your assigned roster.');
  }
  const report = {
    teacherUid: auth.currentUser.uid,
    studentUid: values.studentUid,
    grade: rosterSnapshot.data().grade,
    section: rosterSnapshot.data().section,
    targetSkill: normalize(values.targetSkill),
    supportStrategy: normalize(values.supportStrategy),
    observedOutcome: normalize(values.observedOutcome),
    nextSteps: normalize(values.nextSteps),
    status: normalize(values.status)
  };
  if (values.reviewAt) report.reviewAt = Timestamp.fromDate(new Date(`${values.reviewAt}T00:00:00`));
  if (reportId) {
    await updateDoc(doc(db, 'interventionReports', reportId), { ...report, updatedAt: serverTimestamp() });
    return reportId;
  }
  const ref = doc(collection(db, 'interventionReports'));
  await setDoc(ref, { ...report, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

async function handleAuthState(authUser) {
  if (!authUser) {
    currentProfile = null;
    window.readwySetFirebaseSession?.(null, null);
    return;
  }
  if (authUser.uid === provisioningUid) return;
  try {
    const snapshot = await getDoc(doc(db, 'profiles', authUser.uid));
    if (auth.currentUser?.uid !== authUser.uid) return;
    if (!snapshot.exists()) {
      // A DepEd teacher who signed up on the start screen: create their teacher profile now.
      const teacher = await provisionTeacher(authUser).catch(error => { window.readwyFirebaseAuthError = error.message; return null; })
        || await provisionStudent(authUser).catch(error => { window.readwyFirebaseAuthError = error.message; return null; });
      if (teacher && auth.currentUser?.uid === authUser.uid) {
        window.readwySetFirebaseSession?.(authUser, teacher);
        return;
      }
      currentProfile = null;
      window.readwySetFirebaseSession?.(null, null);
      return;
    }
    currentProfile = snapshot.data();
    window.readwySetFirebaseSession?.(authUser, currentProfile);
  } catch (error) {
    if (auth.currentUser?.uid !== authUser.uid) return;
    currentProfile = null;
    window.readwyFirebaseAuthError = error.message || 'Could not load the account profile.';
    window.readwySetFirebaseSession?.(null, null);
  }
}

const api = {
  auth,
  db,
  get profile() { return currentProfile; },
  signIn,
  signUpStudent,
  signOut: () => signOut(auth),
  loadTeacherData,
  createClassroom,
  setClassroomActive,
  setPostTestDate,
  teacherPostTestDate,
  setJoinCode,
  watchSectionPostTestDate,
  saveQuestProgress,
  loadQuestAwards,
  saveInterventionReport,
  syncLegacyRecord,
  syncIntervention,
  sendPasswordResetEmail: email => sendPasswordResetEmail(auth, normalize(email).toLowerCase())
};
window.readwyFirebase = api;
window.readwyFirebaseReady = new Promise(resolve => {
  let firstState = true;
  onAuthStateChanged(auth, async authUser => {
    await handleAuthState(authUser);
    if (firstState) {
      firstState = false;
      resolve(api);
    }
  }, error => {
    window.readwyFirebaseAuthError = error.message || 'Firebase Authentication is unavailable.';
    resolve(api);
  });
});
