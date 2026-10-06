import assert from 'node:assert/strict';
import { build } from 'esbuild';
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
globalThis.window = { addEventListener() {}, removeEventListener() {} };
let resolveProfile;
const profilePromise = new Promise(resolve => { resolveProfile = resolve; });
let profileReads = 0, hydrationRuns = 0, observer;
const auth = { currentUser: null };
globalThis.authRegression = {
  auth, states: [], hooks: [], effects: [], cursor: 0,
  getProfile: () => { profileReads++; return profilePromise; },
  hydrate: () => { hydrationRuns++; return new Promise(() => {}); },
  observe: callback => { observer = callback; return () => {}; },
  signIn: async () => { auth.currentUser = { uid: 'test-student' }; void observer(auth.currentUser); return { user: auth.currentUser }; },
};
const mock = `const h=globalThis.authRegression;
export const createContext=()=>({Provider:'provider'}); export const useContext=()=>{};
export const useState=value=>{const i=h.cursor++; if(!(i in h.states))h.states[i]=value;return[h.states[i],v=>h.states[i]=typeof v==='function'?v(h.states[i]):v]};
export const useRef=value=>{const i=h.cursor++;return h.hooks[i]||(h.hooks[i]={current:value})};
export const useCallback=fn=>fn; export const useEffect=fn=>h.effects.push(fn);
export const jsx=(type,props)=>({type,props}); export const jsxs=jsx;
export const firebaseAuth=h.auth; export const usernameEmail=v=>v+'@users.studyforge.local';
export const getProfile=h.getProfile; export const hydrateCloudData=h.hydrate; export const clearCloudCache=()=>{};
export const trackEvent=()=>{};
export const createProfile=()=>{}; export const updateCloudProfile=()=>{};
export const onAuthStateChanged=(_,fn)=>h.observe(fn); export const signInWithEmailAndPassword=h.signIn;
export const signOut=async()=>{h.auth.currentUser=null;await h.observe(null)};
export const createUserWithEmailAndPassword=()=>{}; export const EmailAuthProvider={}; export const reauthenticateWithCredential=()=>{}; export const updatePassword=()=>{};export const updateProfile=()=>{};`;
const output = await build({ entryPoints: ['src/context/AuthModalContext.jsx'], bundle: true, write: false, format: 'esm', platform: 'node', jsx: 'automatic', plugins: [{ name: 'mock', setup(b) {
  b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|firebase\/auth|\.\.\/utils\/(?:firebase|cloudData|analytics))$/ }, () => ({ path: 'mock', namespace: 'mock' }));
  b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: mock, loader: 'js' }));
} }] });
const { AuthModalProvider } = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
const context = AuthModalProvider({ children: null }).props.value;
for (const effect of globalThis.authRegression.effects) effect();
const login = context.login({ username: 'student', password: 'test-only-password' });
await Promise.resolve();
assert.equal(profileReads, 1, 'observer and login share one profile read');
resolveProfile({ uid: 'test-student', username: 'student', role: 'student' });
const session = await login;
assert.equal(session.uid, 'test-student');
assert.equal(hydrationRuns, 1, 'dashboard sync runs once');
assert.equal(JSON.parse(storage.get('studyforge.local-session')).password, undefined);
assert.equal(profileReads, 1);
console.log('Passed login performance: one profile read, one background sync, login resolves while data sync is still pending, no password stored.');
