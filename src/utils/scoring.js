import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from './firebase';
const functions = getFunctions(firebaseApp, 'us-central1');
export const callScoring = async (name, data) => (await httpsCallable(functions, name)(data)).data;
