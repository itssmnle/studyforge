import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { randomInt } from 'node:crypto';
import { scienceSubjects } from './curriculum.js';
import { grade } from './grading.js';
initializeApp();
const db = getFirestore();
const fail = (message, code = 'invalid-argument') => { throw new HttpsError(code, message); };
const id = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,180}$/.test(value);
const callable = handler => onCall({ maxInstances: 10 }, async request => {
  if (!request.auth) fail('Sign in to continue', 'unauthenticated');
  // Callable token validation alone does not check session revocation.
  try { await getAuth().verifyIdToken(request.rawRequest.headers.authorization?.replace(/^Bearer /, ''), true); }
  catch { fail('Sign in again', 'unauthenticated'); }
  const profile = (await db.doc(`users/${request.auth.uid}`).get()).data();
  if (profile?.role !== 'student') fail('Student account required', 'permission-denied');
  return handler(request.data, request.auth.uid, profile);
});
function fields(data, allowed) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(k => !allowed.includes(k))) fail('Unexpected fields');
}
async function unit(transaction, uid, subject, topic) {
  if (!id(subject) || !id(topic)) fail('Invalid unit');
  const course = scienceSubjects.find(s => s.id === subject);
  const index = course?.topics.findIndex(t => t.id === topic) ?? -1;
  if (index < 0) fail('Unknown unit');
  const refs = course.topics.slice(0, index + 1).map(t => db.doc(`users/${uid}/mastery/${subject}__${t.id}`));
  const records = await transaction.getAll(...refs);
  if (records.slice(0, -1).some(r => r.data()?.gradingVersion !== 1 || r.data()?.bestScore < 80)) fail('Complete preceding units first', 'failed-precondition');
  return { ref: refs.at(-1), previous: records.at(-1).data() || {} };
}
export const markCourseNotes = callable(async (data, uid) => {
  fields(data, ['subject', 'topic']);
  await db.runTransaction(async tx => {
    const { ref } = await unit(tx, uid, data.subject, data.topic);
    tx.set(ref, { subject: data.subject, topic: data.topic, notesRead: true, updatedAt: new Date().toISOString() }, { merge: true });
  });
  return { saved: true };
});
export const startCourseQuiz = callable(async (data, uid) => {
  fields(data, ['subject', 'topic']);
  return db.runTransaction(async tx => {
    const { previous } = await unit(tx, uid, data.subject, data.topic);
    if (!previous.notesRead) fail('Read the notes first', 'failed-precondition');
    const pool = (await tx.get(db.collection('questions').where('subject', '==', data.subject))).docs.map(d => ({ ...d.data(), id: d.id })).filter(q => q.topic === data.topic && q.type === 'multiple-choice');
    if (!pool.length) fail('No questions available', 'failed-precondition');
    for (let i = pool.length - 1; i > 0; i--) { const j = randomInt(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const questions = pool.slice(0, 10);
    const ref = db.collection('courseAttempts').doc();
    tx.create(ref, { uid, subject: data.subject, topic: data.topic, questions, expiresAt: Date.now() + 3600000 });
    return { attemptId: ref.id, questions: questions.map(({ id, prompt, options }) => ({ id, prompt, options })) };
  });
});
export const submitCourseQuiz = callable(async (data, uid) => {
  fields(data, ['attemptId', 'answers']);
  if (!id(data.attemptId)) fail('Invalid attempt');
  return db.runTransaction(async tx => {
    const attemptRef = db.doc(`courseAttempts/${data.attemptId}`);
    const attempt = (await tx.get(attemptRef)).data();
    if (!attempt || attempt.uid !== uid) fail('Attempt unavailable', 'permission-denied');
    if (attempt.result) return attempt.result;
    if (attempt.expiresAt < Date.now()) fail('Quiz expired. Start again.', 'failed-precondition');
    const { ref, previous } = await unit(tx, uid, attempt.subject, attempt.topic);
    let result;
    try { result = grade(attempt.questions, data.answers); } catch (e) { fail(e.message); }
    tx.set(ref, { subject: attempt.subject, topic: attempt.topic, notesRead: true, gradingVersion: 1, bestScore: Math.max(previous.gradingVersion === 1 ? previous.bestScore || 0 : 0, result.score), lastScore: result.score, attempts: (previous.gradingVersion === 1 ? previous.attempts || 0 : 0) + 1, updatedAt: new Date().toISOString() });
    tx.update(attemptRef, { result });
    return result;
  });
});
export const submitHomework = callable(async (data, uid, profile) => {
  fields(data, ['assignmentId', 'answers']);
  if (!id(data.assignmentId)) fail('Invalid assignment');
  return db.runTransaction(async tx => {
    const assignment = (await tx.get(db.doc(`assignments/${data.assignmentId}`))).data();
    if (!assignment || !id(assignment.classId)) fail('Assignment unavailable', 'not-found');
    const schoolClass = (await tx.get(db.doc(`classes/${assignment.classId}`))).data();
    if (!schoolClass?.studentUsernames?.includes(profile.username)) fail('Class membership required', 'permission-denied');
    const ref = db.doc(`submissions/${data.assignmentId}__${uid}`);
    const prior = (await tx.get(ref)).data();
    if (prior?.gradingVersion === 1) return prior;
    let result;
    try { result = grade(assignment.questionSnapshot, data.answers); } catch (e) { fail(e.message, 'failed-precondition'); }
    const submission = { ...result, id: ref.id, assignmentId: data.assignmentId, classId: assignment.classId, teacherUid: assignment.createdByUid, studentUid: uid, username: profile.username, subject: assignment.subject, topic: assignment.topic, topicName: assignment.topicName || assignment.topic, completedAt: new Date().toISOString(), gradingVersion: 1 };
    tx.set(ref, submission);
    return submission;
  });
});
