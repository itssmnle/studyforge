import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "revision-hub-ee911",
  appId: "1:375663408964:web:f84e1e755d657f474c0911",
  storageBucket: "revision-hub-ee911.firebasestorage.app",
  apiKey: "AIzaSyDADTmbdAU3K8s6aMv4DMPRSyXsWCkNHhY",
  authDomain: "revision-hub-ee911.firebaseapp.com",
  messagingSenderId: "375663408964",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
void setPersistence(firebaseAuth, browserLocalPersistence);
export const firestore = getFirestore(firebaseApp);

export const usernameEmail = (username) => `${username.trim().toLowerCase()}@users.studyforge.local`;
