import fs from 'node:fs/promises';
import os from 'node:os';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { writeFirestoreDocuments, deleteFirestoreDocuments } from '../scripts/firestoreImport.mjs';
const projectId = 'revision-hub-ee911';
const config = JSON.parse(await fs.readFile(`${os.homedir()}/.config/configstore/firebase-tools.json`, 'utf8'));
initializeApp({ projectId, credential: { getAccessToken: async () => ({ access_token: config.tokens.access_token, expires_in: 3600 }) } });
const auth = getAuth();
const uid = `security-check-${randomUUID()}`;
const email = `${uid}@users.studyforge.local`;
const password = randomUUID();
let credentials;
try {
  await auth.createUser({ uid, email, password });
  credentials = await writeFirestoreDocuments([{ collection: 'users', id: uid, data: { username: uid, role: 'student' } }], { projectId });
  const login = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDADTmbdAU3K8s6aMv4DMPRSyXsWCkNHhY', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
  assert.equal(login.status, 200);
  const { idToken } = await login.json();
  const request = async (path, fields) => (await fetch(`https://firestore.googleapis.com/v1/${credentials.databaseRoot}/${path}`, { method: fields ? 'PATCH' : 'GET', headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' }, ...(fields ? { body: JSON.stringify({ fields }) } : {}) })).status;
  assert.equal(await request(`users/${uid}`), 200);
  assert.equal(await request(`users/${uid}/mastery/test`, { bestScore: { integerValue: '100' } }), 403);
  assert.equal(await request(`submissions/${uid}`, { studentUid: { stringValue: uid }, score: { integerValue: '100' } }), 403);
  assert.equal(await request(`users/${uid}`, { username: { stringValue: uid }, role: { stringValue: 'teacher' } }), 403);
  await deleteFirestoreDocuments([`${credentials.databaseRoot}/users/${uid}`], credentials);
  assert.equal(await request(`users/${uid}`, { username: { stringValue: 'someone-else' }, role: { stringValue: 'student' } }), 403);
  assert.equal(await request(`users/${uid}`, { username: { stringValue: uid }, role: { stringValue: 'student' } }), 200);
  await writeFirestoreDocuments([{ collection: 'blockedAccounts', id: uid, data: { reason: 'security-rule-test' } }], { projectId });
  assert.equal(await request(`users/${uid}`), 403);
  console.log('Passed live rules: own-profile read; mastery, submission, role escalation denied; pre-existing token denied after blocking.');
} finally {
  if (credentials) await deleteFirestoreDocuments(['users', 'blockedAccounts', 'submissions'].map(c => `${credentials.databaseRoot}/${c}/${uid}`).concat(`${credentials.databaseRoot}/users/${uid}/mastery/test`), credentials);
  await auth.deleteUser(uid);
  console.log('Temporary verification account and documents removed.');
}
