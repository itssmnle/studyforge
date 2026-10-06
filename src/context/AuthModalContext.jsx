import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { createProfile, getProfile, hydrateCloudData, updateCloudProfile, clearCloudCache } from "../utils/cloudData";
import { firebaseAuth, usernameEmail } from "../utils/firebase";
import { trackEvent } from "../utils/analytics";

const AuthModalContext = createContext(null);
const SESSION_KEY = "studyforge.local-session";

const normaliseUsername = (username) => username.trim().toLowerCase();

const sessionFromProfile = (profile) => ({
  uid: profile.uid,
  username: profile.username,
  displayName: profile.fullName,
  fullName: profile.fullName,
  profession: profile.profession || "",
  role: profile.role,
  selectedSubjectIds: profile.selectedSubjectIds,
});

const friendlyAuthError = (error) => {
  if (error.code === "auth/invalid-credential") return "The username or password is incorrect.";
  if (error.code === "auth/email-already-in-use") return "That username is already registered.";
  if (error.code === "auth/weak-password") return "Use at least 8 characters for your password.";
  if (error.code === "auth/wrong-password") return "Your current password is incorrect.";
  if (error.code === "auth/requires-recent-login") return "Please log out, log in again, and retry changing your password.";
  if (error.code === "auth/too-many-requests") return "Too many attempts. Wait a moment and try again.";
  if (error.code === "permission-denied") return "Your account does not have permission to access this area.";
  return error.message || "Authentication failed. Please try again.";
};

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const registrationInProgress = useRef(false);

  const sessionLoad = useRef(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback((session) => {
    setDataLoading(true); setDataError('');
    return hydrateCloudData(session).catch(error => {
      if (firebaseAuth.currentUser?.uid === session.uid) setDataError(error.message);
    }).finally(() => {
      if (firebaseAuth.currentUser?.uid === session.uid) setDataLoading(false);
    });
  }, []);
  const activateUser = useCallback((firebaseUser) => {
    if (sessionLoad.current?.uid === firebaseUser.uid) return sessionLoad.current.promise;
    setUser(current => current?.uid === firebaseUser.uid ? current : null);
    const promise = getProfile(firebaseUser.uid).then(profile => {
      if (!profile) throw new Error('This account has no StudyForge profile.');
      if (firebaseAuth.currentUser?.uid !== firebaseUser.uid) throw new Error('Sign-in was cancelled.');
      let previous;
      try { previous = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { /* Invalid cached session. */ }
      if (previous?.uid !== profile.uid) clearCloudCache();
      const session = sessionFromProfile(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session); setAuthReady(true);
      void refreshData(session);
      return session;
    }).catch(error => { sessionLoad.current = null; throw error; });
    sessionLoad.current = { uid: firebaseUser.uid, promise };
    return promise;
  }, [refreshData]);

  useEffect(() => {
    const changed = () => setDataVersion(version => version + 1);
    const events = ['studyforge:classes-changed', 'studyforge:assignments-changed', 'studyforge:progress-changed'];
    events.forEach(event => window.addEventListener(event, changed));
    return () => events.forEach(event => window.removeEventListener(event, changed));
  }, []);
  useEffect(() => onAuthStateChanged(firebaseAuth, async firebaseUser => {
    if (!firebaseUser) {
      sessionLoad.current = null;
      localStorage.removeItem(SESSION_KEY); clearCloudCache();
      setUser(null); setAuthReady(true); setDataLoading(false); setDataError('');
      return;
    }
    if (registrationInProgress.current) return;
    try { await activateUser(firebaseUser); }
    catch (error) { setDataError(error.message); setAuthReady(true); }
  }), [activateUser]);

  const openLogin = (mode = "login") => {
    setAuthMode(mode);
    setLoginOpen(true);
  };

  const register = async ({ username, fullName, password }) => {
    const normalizedUsername = normaliseUsername(username);
    if (!/^[a-z0-9_-]{3,32}$/.test(normalizedUsername)) throw new Error("Use 3 to 32 letters, numbers, hyphens, or underscores.");
    if (!fullName.trim()) throw new Error("Enter the account holder's full name.");
    if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
    registrationInProgress.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, usernameEmail(normalizedUsername), password);
      await updateProfile(credential.user, { displayName: fullName.trim() });
      const profile = await createProfile(credential.user.uid, {
        username: normalizedUsername,
        fullName: fullName.trim(),
        profession: "Student",
        role: "student",
        createdAt: new Date().toISOString(),
      });
      const session = sessionFromProfile(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
      setLoginOpen(false);
      setAuthReady(true);
      trackEvent("account_creation", { source: "student-registration" });
      void refreshData(session);
      return session;
    } catch (error) {
      if (firebaseAuth.currentUser) await signOut(firebaseAuth);
      throw new Error(friendlyAuthError(error));
    } finally {
      registrationInProgress.current = false;
    }
  };

  const login = async ({ username, password }) => {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, usernameEmail(normaliseUsername(username)), password);
      const session = await activateUser(credential.user);
      setLoginOpen(false);
      return session;
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (!firebaseAuth.currentUser || !user) throw new Error("Please log in again before changing your password.");
    if (newPassword.length < 8) throw new Error("Use at least 8 characters for your new password.");
    try {
      const credential = EmailAuthProvider.credential(usernameEmail(user.username), currentPassword);
      await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
      await updatePassword(firebaseAuth.currentUser, newPassword);
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  };

  const updateCourseSelection = async (selectedSubjectIds) => {
    if (!user?.uid) throw new Error("Please log in again before changing your courses.");
    await updateCloudProfile(user.uid, { selectedSubjectIds });
    const nextUser = { ...user, selectedSubjectIds };
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = { dataLoading, dataError, dataVersion, retryData: () => user && refreshData(user), authReady, isLoginOpen, authMode, user, openLogin, closeLogin: () => setLoginOpen(false), setAuthMode, register, login, logout, changePassword, updateCourseSelection };
  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal must be used within AuthModalProvider");
  return context;
}
