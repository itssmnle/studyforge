import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { firestore, firebaseAuth } from "./firebase";
import { gradeHomework } from "./homeworkGrading";
import { isUnusedLegacyClassPreset } from "./legacyClassPresets";

const SESSION_KEY = "studyforge.local-session";
const CLASS_KEY = "studyforge.classes";
const ASSIGNMENT_KEY = "studyforge.assignments";
const SUBMISSION_KEY = "studyforge.homework-submissions";
const PRIVATE_KEY = "studyforge.private-practice";
const QUESTION_KEY = "studyforge.question-bank";

const currentSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

const cache = (key, value, eventName) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(eventName));
};

const documents = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

const chunk = (values, size = 30) => {
  const groups = [];
  for (let index = 0; index < values.length; index += size) groups.push(values.slice(index, index + size));
  return groups;
};

const uniqueById = (items) => [...new Map(items.map((item) => [item.id, item])).values()];

const queryByValues = async (collectionName, field, values) => {
  if (!values.length) return [];
  const batches = await Promise.all(chunk(values).map((group) => getDocs(query(collection(firestore, collectionName), where(field, "in", group)))));
  return uniqueById(batches.flatMap(documents));
};

export const getProfile = async (uid) => {
  const snapshot = await getDoc(doc(firestore, "users", uid));
  return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null;
};

export const createProfile = async (uid, profile) => {
  await setDoc(doc(firestore, "users", uid), profile);
  return { uid, ...profile };
};

export const updateCloudProfile = async (uid, fields) => {
  await setDoc(doc(firestore, "users", uid), fields, { merge: true });
};

export const listCloudAccounts = async () => documents(await getDocs(collection(firestore, "users")));

export const clearCloudCache = () => {
  [CLASS_KEY, ASSIGNMENT_KEY, SUBMISSION_KEY, QUESTION_KEY].forEach(key => localStorage.removeItem(key));
};

export const hydrateCloudData = async (profile) => {
  const username = profile.username;
  const isTeacher = profile.role === 'teacher';
  const saveCache = (key, value, event) => {
    if (firebaseAuth.currentUser?.uid === profile.uid && currentSession()?.uid === profile.uid) cache(key, value, event);
  };
  const classSnapshotsPromise = Promise.all(isTeacher ? [
    getDocs(query(collection(firestore, 'classes'), where('ownerUid', '==', profile.uid))),
    getDocs(query(collection(firestore, 'classes'), where('teacherUids', 'array-contains', profile.uid))),
  ] : [getDocs(query(collection(firestore, 'classes'), where('studentUsernames', 'array-contains', username)))]);
  const ownedAssignments = isTeacher ? getDocs(query(collection(firestore, 'assignments'), where('createdByUid', '==', profile.uid))).then(documents) : Promise.resolve([]);
  const classesPromise = Promise.all([classSnapshotsPromise, ownedAssignments]).then(async ([snapshots, teacherAssignments]) => {
    const fetchedClasses = uniqueById(snapshots.flatMap(documents));
    const assignedClassIds = new Set(teacherAssignments.map(assignment => assignment.classId));
    const obsoletePresets = fetchedClasses.filter(schoolClass => (
      isUnusedLegacyClassPreset(schoolClass)
      && schoolClass.ownerUid === profile.uid
      && !assignedClassIds.has(schoolClass.id)
    ));
    if (obsoletePresets.length) {
      await Promise.allSettled(obsoletePresets.map(schoolClass => deleteDoc(doc(firestore, 'classes', schoolClass.id))));
    }
    const classes = fetchedClasses.filter(schoolClass => !isUnusedLegacyClassPreset(schoolClass));
    saveCache(CLASS_KEY, classes, 'studyforge:classes-changed');
    return classes;
  });
  const assignmentsPromise = Promise.all([ownedAssignments, classesPromise.then(classes => queryByValues('assignments', 'classId', classes.map(c => c.id)))])
    .then(groups => { const assignments = uniqueById(groups.flat()); saveCache(ASSIGNMENT_KEY, assignments, 'studyforge:assignments-changed'); return assignments; });
  const submissionsPromise = getDocs(query(collection(firestore, 'submissions'), where(isTeacher ? 'teacherUid' : 'studentUid', '==', profile.uid))).then(documents);
  const work = [
    Promise.all([assignmentsPromise, submissionsPromise]).then(([assignments, submissions]) => {
      saveCache(SUBMISSION_KEY, submissions.filter(s => assignments.some(a => a.id === s.assignmentId)).map(s => gradeHomework(s, assignments.find(a => a.id === s.assignmentId))), 'studyforge:progress-changed');
    }),
    (isTeacher ? Promise.resolve([]) : getDocs(query(collection(firestore, 'practice'), where('studentUid', '==', profile.uid))).then(documents))
      .then(practice => saveCache(`${PRIVATE_KEY}.${username}`, practice, 'studyforge:progress-changed')),
    getDocs(collection(firestore, 'questions')).then(snapshot => { if (!snapshot.empty) saveCache(QUESTION_KEY, documents(snapshot), 'studyforge:question-bank-changed'); }),
  ];
  const results = await Promise.allSettled(work);
  if (results.some(result => result.status === 'rejected')) throw new Error('Some data could not load. Please retry.');
};

const runCloudWrite = (operation) => operation.catch((error) => {
  console.error("StudyForge cloud write failed", error);
  window.dispatchEvent(new CustomEvent("studyforge:cloud-error"));
});

export const syncClasses = (nextClasses, previousClasses) => {
  const session = currentSession();
  if (!session?.uid) return;
  const nextIds = new Set(nextClasses.map((schoolClass) => schoolClass.id));
  previousClasses.filter((schoolClass) => !nextIds.has(schoolClass.id)).forEach((schoolClass) => {
    runCloudWrite(deleteDoc(doc(firestore, "classes", schoolClass.id)));
  });
  nextClasses.forEach((schoolClass) => runCloudWrite(setDoc(doc(firestore, "classes", schoolClass.id), {
    ...schoolClass,
    ownerUid: schoolClass.ownerUid || session.uid,
    ownerUsername: schoolClass.ownerUsername || session.username,
    teacherUids: schoolClass.teacherUids || [],
    studentUsernames: schoolClass.studentUsernames || [],
  })));
};

export const syncAssignment = (assignment) => {
  const session = currentSession();
  if (!session?.uid) return;
  return setDoc(doc(firestore, "assignments", assignment.id), {
    ...assignment,
    createdByUid: assignment.createdByUid || session.uid,
    createdByUsername: assignment.createdByUsername || session.username,
  });
};

export const syncSubmission = async (submission) => {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Sign in to submit homework.');
  const ref = doc(firestore, 'submissions', `${submission.assignmentId}__${user.uid}`);
  const cached = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY) || '[]').find(a => a.id === submission.assignmentId);
  const assignment = cached?.questionSnapshot?.length ? cached : (await getDoc(doc(firestore, 'assignments', submission.assignmentId))).data();
  if (!assignment?.questionSnapshot?.length) throw new Error('Ask your teacher to open and save this assignment before submitting.');
  const username = currentSession()?.uid === user.uid ? currentSession().username : (await getProfile(user.uid)).username;
  const saved = await runTransaction(firestore, async tx => {
    const existing = await tx.get(ref);
    if (existing.exists()) return { id: ref.id, ...existing.data() };
    const data = { assignmentId: submission.assignmentId, classId: assignment.classId,
      teacherUid: assignment.createdByUid, studentUid: user.uid, username,
      answers: Object.fromEntries(submission.responses.map(r => [r.questionId, r.answer])),
      selfMarks: submission.selfMarks || {}, schemaVersion: 2, submittedAt: serverTimestamp() };
    tx.set(ref, data);
    return { ...data, id: ref.id, completedAt: new Date().toISOString() };
  });
  return gradeHomework(saved, assignment);
};

export const syncPrivatePractice = (practice) => {
  const session = currentSession();
  if (!session?.uid) return Promise.resolve(false);
  return setDoc(doc(firestore, "practice", `${session.uid}__${practice.id}`), {
    ...practice,
    studentUid: session.uid,
    username: session.username,
  }).then(() => true).catch((error) => {
    console.error("StudyForge practice sync failed", error);
    window.dispatchEvent(new CustomEvent("studyforge:cloud-error"));
    return false;
  });
};

export const removeCloudPrivatePractice = (practiceId) => {
  const session = currentSession();
  if (!session?.uid || !practiceId) return Promise.resolve();
  return deleteDoc(doc(firestore, "practice", `${session.uid}__${practiceId}`));
};

export const syncQuestion = (question) => runCloudWrite(setDoc(doc(firestore, "questions", question.id), question));
export const removeCloudQuestion = (questionId) => runCloudWrite(deleteDoc(doc(firestore, "questions", questionId)));

export const removeCloudAssignment = id => deleteDoc(doc(firestore, 'assignments', id));
