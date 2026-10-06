import fs from 'node:fs/promises';
import os from 'node:os';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { listFirestoreDocuments, writeFirestoreDocuments, deleteFirestoreDocuments } from '../scripts/firestoreImport.mjs';
const projectId = 'revision-hub-ee911';
const config = JSON.parse(await fs.readFile(`${os.homedir()}/.config/configstore/firebase-tools.json`, 'utf8'));
initializeApp({ projectId, credential: { getAccessToken: async () => ({ access_token: config.tokens.access_token, expires_in: 3600 }) } });
const auth = getAuth();
const credentials = { projectId, accessToken: config.tokens.access_token, databaseRoot: `projects/${projectId}/databases/(default)/documents` };
const blocked = (await listFirestoreDocuments('blockedAccounts', credentials)).filter(d => d.fields?.reason?.stringValue === 'unchanged-import-password');
console.log(JSON.stringify({ matchingBlockedAccounts: blocked.length, apply: process.argv.includes('--apply') }));
if (!process.argv.includes('--apply')) process.exit(0);
let enabled = 0;
for (const document of blocked) {
  const uid = document.name.split('/').at(-1);
  await writeFirestoreDocuments([{ collection: 'accountSecurity', id: uid, data: { validAfter: Math.floor(Date.now()/1000) } }], { projectId });
  await auth.revokeRefreshTokens(uid);
  await auth.updateUser(uid, { disabled: false });
  if ((await auth.getUser(uid)).disabled) throw new Error('Enable verification failed');
  await deleteFirestoreDocuments([document.name], credentials);
  enabled++;
  if (enabled % 20 === 0) console.log(JSON.stringify({ enabled }));
}
console.log(JSON.stringify({ reenabled: enabled, passwordsChanged: 0 }));
