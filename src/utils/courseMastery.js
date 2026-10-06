import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';


export const PASS_SCORE = 80;
export const verifiedMastery = record => record.gradingVersion === 1 || record.gradingVersion === 'private-practice' ? record : { ...record, bestScore: 0, lastScore: 0, attempts: 0 };
export const masteryKey = (subject, topic) => `${subject}__${topic}`;
export const masteryLabel = (record) => record?.bestScore >= 100 ? 'Mastered' : record?.bestScore >= PASS_SCORE ? 'Proficient' : record?.attempts ? 'Attempted' : record?.notesRead ? 'Familiar' : 'Not started';
export const unitUnlocked = (topics, index, records, subject) => topics.slice(0, index).every(topic => (records[masteryKey(subject, topic.id)]?.gradingVersion && records[masteryKey(subject, topic.id)]?.bestScore >= PASS_SCORE));

export function useCourseMastery(uid) {
  const [state, setState] = useState({ uid: null, records: {}, ready: false, error: '' });
  useEffect(() => {
    if (!uid) return;
    let cloudRecords = {};
    const refresh = () => {
      let localRecords = {};
      try { localRecords = JSON.parse(localStorage.getItem(`studyforge.course-practice.${uid}`) || '{}'); } catch { /* Ignore corrupt local practice data. */ }
      const records = { ...cloudRecords };
      for (const [key, local] of Object.entries(localRecords)) records[key] = { ...records[key], ...local };
      setState({ uid, records, ready: true, error: '' });
    };
    window.addEventListener('studyforge:course-practice', refresh);
    const unsubscribe = onSnapshot(collection(firestore, 'users', uid, 'mastery'), snapshot => {
      cloudRecords = Object.fromEntries(snapshot.docs.map(item => [item.id, verifiedMastery(item.data())]));
      refresh();
    }, () => setState({ uid, records: {}, ready: true, error: 'Could not load mastery. Check your connection and reload.' }));
    return () => { unsubscribe(); window.removeEventListener('studyforge:course-practice', refresh); };
  }, [uid]);
  return state.uid === uid ? state : { records: {}, ready: false, error: '' };
}

export async function saveCourseMastery(uid, subject, topic, score) {
  if (!uid) throw new Error('Sign in required');
  if (score === undefined) return setDoc(doc(firestore, 'users', uid, 'mastery', masteryKey(subject, topic)), { subject, topic, notesRead: true, updatedAt: serverTimestamp() });
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error('Invalid practice score');
  const key = `studyforge.course-practice.${uid}`;
  const records = JSON.parse(localStorage.getItem(key) || '{}');
  const previous = records[masteryKey(subject, topic)] || {};
  records[masteryKey(subject, topic)] = { subject, topic, notesRead: true, gradingVersion: 'private-practice', bestScore: Math.max(previous.bestScore || 0, score), lastScore: score, attempts: (previous.attempts || 0) + 1 };
  localStorage.setItem(key, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('studyforge:course-practice'));
}
