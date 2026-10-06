import fs from 'node:fs/promises';
import os from 'node:os';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp as adminApp } from 'firebase-admin/app';
import { getAuth as adminAuth } from 'firebase-admin/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, runTransaction, terminate } from 'firebase/firestore';
import { writeFirestoreDocuments, deleteFirestoreDocuments } from '../scripts/firestoreImport.mjs';
const projectId = 'revision-hub-ee911';
const config = JSON.parse(await fs.readFile(`${os.homedir()}/.config/configstore/firebase-tools.json`, 'utf8'));
adminApp({ projectId, credential: { getAccessToken: async () => ({ access_token: config.tokens.access_token, expires_in: 3600 }) } });
const admin = adminAuth();
const uid = `spark-check-${randomUUID()}`;
const password = randomUUID();
const app = initializeApp({ projectId, apiKey: 'AIzaSyDADTmbdAU3K8s6aMv4DMPRSyXsWCkNHhY' }, uid);
const auth = getAuth(app), db = getFirestore(app);
let credentials;
const denied = promise => assert.rejects(promise, e => e.code === 'permission-denied');
try {
  await admin.createUser({ uid, email: `${uid}@users.studyforge.local`, password });
  credentials = await writeFirestoreDocuments([
    { collection: 'users', id: uid, data: { username: uid, role: 'student' } },
    { collection: 'classes', id: uid, data: { ownerUid: 'test-teacher', teacherUids: [], studentUsernames: [uid] } },
    { collection: 'assignments', id: uid, data: { createdByUid: 'test-teacher', classId: uid, assignedStudentUsernames: [uid], subject: 'biology', topic: 'cells-and-organisation', questionSnapshot: [{ id: 'q1', prompt: 'A?', answer: 'A' }] } },
  ], { projectId });
  await signInWithEmailAndPassword(auth, `${uid}@users.studyforge.local`, password);
  const ref = doc(db, 'submissions', `${uid}__${uid}`);
  assert.equal((await getDoc(ref)).exists(), false);
  const payload = { assignmentId: uid, classId: uid, teacherUid: 'test-teacher', studentUid: uid, username: uid, answers: { q1: 'B' }, selfMarks: { q1: true }, schemaVersion: 2, submittedAt: serverTimestamp() };
  await denied(setDoc(ref, { ...payload, score: 100 }));
  await denied(setDoc(ref, { ...payload, teacherUid: uid }));
  await denied(setDoc(ref, { ...payload, studentUid: 'another-student' }));
  await denied(setDoc(ref, { ...payload, username: 'another-student' }));
  await denied(setDoc(ref, { ...payload, submittedAt: new Date(0) }));
  await runTransaction(db, async tx => { assert.equal((await tx.get(ref)).exists(), false); tx.set(ref, payload); });
  assert.equal((await getDoc(ref)).data().answers.q1, 'B');
  assert.equal((await getDoc(ref)).data().selfMarks.q1, true);
  await denied(updateDoc(ref, { answers: { q1: 'A' } }));
  await denied(updateDoc(ref, { score: 100 }));
  const notes = doc(db, 'users', uid, 'mastery', 'biology__cells-and-organisation');
  await setDoc(notes, { subject: 'biology', topic: 'cells-and-organisation', notesRead: true, updatedAt: serverTimestamp() });
  await denied(updateDoc(notes, { bestScore: 100 }));
  await writeFirestoreDocuments([{ collection: 'accountSecurity', id: uid, data: { validAfter: Math.floor(Date.now()/1000) } }], { projectId });
  await denied(getDoc(doc(db, 'users', uid)));
  console.log('Passed live Spark rules: answer-only transaction, canonical identities, server timestamp, immutable homework, notes-only mastery, and old-session rejection.');
} finally {
  await signOut(auth);
  await terminate(db);
  await deleteApp(app);
  if (credentials) await deleteFirestoreDocuments(['users','classes','assignments','accountSecurity'].map(c => `${credentials.databaseRoot}/${c}/${uid}`).concat(`${credentials.databaseRoot}/submissions/${uid}__${uid}`, `${credentials.databaseRoot}/users/${uid}/mastery/biology__cells-and-organisation`), credentials);
  await admin.deleteUser(uid);
  console.log('Temporary Spark verification account and documents removed.');
}
