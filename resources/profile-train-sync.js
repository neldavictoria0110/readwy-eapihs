/* Keep the sign-up profile available on the login device and on any other device.
   The train page keeps the full local record; when a verified Firebase student
   signs in, the Firestore profile fills any details that are missing locally. */
import { getApps, getApp, initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const STORE = 'READwy_new_2026_local_';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyADjYOGoVAoFR6IkTbP_U2D_RYMpZeIrFI',
  authDomain: 'readwy-bda35.firebaseapp.com',
  projectId: 'readwy-bda35',
  storageBucket: 'readwy-bda35.firebasestorage.app',
  messagingSenderId: '369867582254',
  appId: '1:369867582254:web:cb7255d13805be0ee2a8bf'
};
const key = value => String(value || '').trim().toLowerCase();
const readJson = name => { try { return JSON.parse(localStorage.getItem(STORE + name) || 'null'); } catch { return null; } };
const writeJson = (name, value) => { try { localStorage.setItem(STORE + name, JSON.stringify(value)); } catch {} };
const profiles = () => readJson('studentProfiles') || {};

window.readwyTrainProfileFor = email => {
  const all = profiles();
  const account = key(email);
  if (account && all[account]) return all[account];
  let last = '';
  try { last = key(localStorage.getItem(STORE + 'lastSignup')); } catch {}
  return last && all[last] ? all[last] : null;
};

window.readwyHydrateTrainProfile = async user => {
  if (!user || !user.uid || !user.email) return false;
  const email = key(user.email);
  try {
    const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app, 'readwy-records');
    const snapshot = await getDoc(doc(db, 'profiles', user.uid));
    if (!snapshot.exists()) return false;
    const cloud = snapshot.data();
    if (cloud.role !== 'student') return false;

    const local = profiles()[email] || {};
    const current = readJson('user') || {};
    const sameCurrent = current && (current.role !== 'student' ||
      key(current.accountEmail || current.email) === email);
    const merged = { ...cloud };
    // Details already on this device, including Keypass edits, stay under the learner's control.
    for (const source of [sameCurrent ? current : {}, local]) {
      for (const [name, value] of Object.entries(source)) {
        if (value !== undefined && value !== null && String(value).trim() !== '') merged[name] = value;
      }
    }
    merged.role = 'student';
    merged.email = email;
    merged.accountEmail = email;
    merged.uid = cloud.uid || user.uid;
    merged.grade = Number(merged.grade) || 7;

    const all = profiles();
    all[email] = merged;
    writeJson('studentProfiles', all);
    writeJson('user', merged);
    writeJson('lastSignup', email);
    return true;
  } catch (error) {
    console.error('READwy profile sync could not load the sign-up record', error);
    return false;
  }
};
