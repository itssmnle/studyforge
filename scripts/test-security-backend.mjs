import assert from 'node:assert/strict';
import { build } from 'esbuild';
const records = new Map();
const ref = path => ({ path, id: path.split('/').at(-1) });
const snap = r => ({ id: r.id, data: () => records.get(r.path) });
const tx = {
  get: async r => r.query ? { docs: [...records].filter(([path, data]) => path.startsWith(`${r.path}/`) && data[r.field] === r.value).map(([path]) => snap(ref(path))) } : snap(r),
  getAll: async (...refs) => refs.map(snap),
  set: (r, data, options) => records.set(r.path, options?.merge ? { ...records.get(r.path), ...data } : data),
  create: (r, data) => { assert.ok(!records.has(r.path)); records.set(r.path, data); },
  update: (r, data) => records.set(r.path, { ...records.get(r.path), ...data }),
};
globalThis.securityTestDb = {
  doc: path => ({ ...ref(path), get: async () => snap(ref(path)) }),
  collection: path => ({ doc: () => ref(`${path}/attempt-${records.size}`), where: (field, op, value) => ({ query: true, path, field, value }) }),
  runTransaction: async fn => fn(tx),
};
globalThis.securityTokenValid = true;
const output = await build({ entryPoints: ['functions/index.js'], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'firebase-test', setup(b) {
  b.onResolve({ filter: /^firebase-(admin|functions)\// }, args => ({ path: args.path, namespace: 'mock' }));
  b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: `export const initializeApp=()=>{}; export const getFirestore=()=>globalThis.securityTestDb; export const getAuth=()=>({verifyIdToken:async()=>{if(!globalThis.securityTokenValid)throw Error('revoked')}}); export const onCall=(_,handler)=>handler; export class HttpsError extends Error {constructor(code,message){super(message);this.code=code;}}`, loader: 'js' }));
} }] });
const api = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
const invoke = (name, data, uid = 'student') => api[name]({ data, auth: uid ? { uid } : null, rawRequest: { headers: { authorization: 'Bearer test' } } });
records.set('users/student', { role: 'student', username: 'alice' });
records.set('users/outsider', { role: 'student', username: 'bob' });
records.set('users/teacher', { role: 'teacher', username: 'teacher' });
const q = { id: 'q1', subject: 'biology', topic: 'cells-and-organisation', type: 'multiple-choice', prompt: 'Pick A', options: ['A','B'], answer: 'A' };
records.set('questions/q1', q);
const unit = { subject: q.subject, topic: q.topic };
await assert.rejects(invoke('markCourseNotes', unit, null), { code: 'unauthenticated' });
globalThis.securityTokenValid = false;
await assert.rejects(invoke('markCourseNotes', unit), { code: 'unauthenticated' });
globalThis.securityTokenValid = true;
await assert.rejects(invoke('markCourseNotes', unit, 'teacher'), { code: 'permission-denied' });
await assert.rejects(invoke('markCourseNotes', { ...unit, score: 100 }), { code: 'invalid-argument' });
await assert.rejects(invoke('startCourseQuiz', unit), { code: 'failed-precondition' });
await invoke('markCourseNotes', unit);
const attempt = await invoke('startCourseQuiz', unit);
assert.equal(attempt.questions[0].answer, undefined);
await assert.rejects(invoke('submitCourseQuiz', { attemptId: attempt.attemptId, answers: { q1: 'A' } }, 'outsider'), { code: 'permission-denied' });
await assert.rejects(invoke('submitCourseQuiz', { attemptId: attempt.attemptId, answers: { injected: 'A' } }), { code: 'invalid-argument' });
await assert.rejects(invoke('markCourseNotes', { subject: 'biology', topic: 'body-systems-and-movement' }), { code: 'failed-precondition' });
const result = await invoke('submitCourseQuiz', { attemptId: attempt.attemptId, answers: { q1: 'A' } });
assert.equal(result.score, 100);
assert.deepEqual(await invoke('submitCourseQuiz', { attemptId: attempt.attemptId, answers: { q1: 'B' } }), result);
assert.equal(records.get('users/student/mastery/biology__cells-and-organisation').attempts, 1);
await invoke('markCourseNotes', { subject: 'biology', topic: 'body-systems-and-movement' });
records.set('classes/class1', { studentUsernames: ['alice'] });
records.set('assignments/hw1', { classId: 'class1', createdByUid: 'teacher', subject: q.subject, topic: q.topic, questionSnapshot: [q] });
await assert.rejects(invoke('submitHomework', { assignmentId: 'hw1', answers: { q1: 'A' } }, 'outsider'), { code: 'permission-denied' });
await assert.rejects(invoke('submitHomework', { assignmentId: 'hw1', answers: { q1: 'B' }, score: 100 }), { code: 'invalid-argument' });
const submission = await invoke('submitHomework', { assignmentId: 'hw1', answers: { q1: 'B' } });
assert.equal(submission.score, 0);
assert.equal(submission.studentUid, 'student');
assert.equal(submission.teacherUid, 'teacher');
assert.deepEqual(await invoke('submitHomework', { assignmentId: 'hw1', answers: { q1: 'A' } }), submission);
console.log('Passed: auth, revocation, roles, payload injection, prerequisites, server question selection, grading, ownership, and idempotent retries.');
