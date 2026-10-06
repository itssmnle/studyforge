// Run after firebase login. Dry run by default; --apply disables confirmed default-password imports.
import fs from 'node:fs/promises';
import os from 'node:os';
import { scryptSync, createCipheriv, timingSafeEqual } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { writeFirestoreDocuments } from '../scripts/firestoreImport.mjs';
const projectId = 'revision-hub-ee911';
const config = JSON.parse(await fs.readFile(`${os.homedir()}/.config/configstore/firebase-tools.json`, 'utf8'));
initializeApp({ projectId, credential: { getAccessToken: async () => ({ access_token: config.tokens.access_token, expires_in: 3600 }) } });
const auth = getAuth();
const imported = JSON.parse(await fs.readFile(new URL('../.firebase-import/users.json', import.meta.url), 'utf8')).users;
const profiles = JSON.parse(await fs.readFile(new URL('../.firebase-import/profiles.json', import.meta.url), 'utf8'));
const byId = new Map(imported.map(u => [u.localId, u]));
const teachers = new Set(profiles.filter(p => p.role === 'teacher').map(p => p.uid));
const response = await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`, { headers: { Authorization: `Bearer ${config.tokens.access_token}` } });
if (!response.ok) throw new Error('Cannot obtain hash configuration');
const hash = (await response.json()).signIn.hashConfig;
if (hash.algorithm !== 'SCRYPT') throw new Error('Unsupported password algorithm');
const matchesDefault = user => {
  const salt = Buffer.concat([Buffer.from(user.passwordSalt, 'base64'), Buffer.from(hash.saltSeparator, 'base64')]);
  const key = scryptSync('password', salt, 64, { N: 2 ** hash.memoryCost, r: hash.rounds, p: 1, maxmem: 256 * 1024 * 1024 });
  const cipher = createCipheriv('aes-256-ctr', key.subarray(0,32), Buffer.alloc(16));
  const actual = Buffer.concat([cipher.update(Buffer.from(hash.signerKey, 'base64')), cipher.final()]);
  key.fill(0);
  const expected = Buffer.from(user.passwordHash, 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
const candidates = [];
let pageToken, changed = 0, unverifiable = 0;
do {
  const page = await auth.listUsers(1000, pageToken);
  for (const user of page.users) {
    const original = byId.get(user.uid);
    if (!original) continue;
    if (!user.passwordHash || !user.passwordSalt) { unverifiable++; continue; }
    if ((user.passwordHash === original.passwordHash && user.passwordSalt === original.salt) || matchesDefault(user)) candidates.push(user);
    else changed++;
  }
  pageToken = page.pageToken;
} while (pageToken);
candidates.sort((a,b) => Number(teachers.has(b.uid)) - Number(teachers.has(a.uid)));
console.log(JSON.stringify({ confirmedDefault: candidates.length, teachers: candidates.filter(u => teachers.has(u.uid)).length, changed, unverifiable, apply: process.argv.includes('--apply') }));
if (!process.argv.includes('--apply')) process.exit(0);
let secured = 0, alreadyDisabled = 0;
for (const user of candidates) {
  if (user.disabled) { alreadyDisabled++; continue; }
  // Rules consult this record to immediately reject even previously issued ID tokens.
  await writeFirestoreDocuments([{ collection: 'blockedAccounts', id: user.uid, data: { blockedAt: new Date().toISOString(), reason: 'unchanged-import-password' } }], { projectId });
  await auth.updateUser(user.uid, { disabled: true });
  await auth.revokeRefreshTokens(user.uid);
  const verified = await auth.getUser(user.uid);
  if (!verified.disabled) throw new Error('Account disable verification failed');
  secured++;
  if (secured % 25 === 0) console.log(JSON.stringify({ secured }));
}
console.log(JSON.stringify({ disabledAndRevoked: secured, alreadyDisabled, unverifiable }));
