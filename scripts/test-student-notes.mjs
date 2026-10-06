import assert from "node:assert/strict";
import { build } from "esbuild";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
globalThis.notesCloudAvailable = false;

const mock = `
export const firestore = {};
export const collection = (...parts) => parts.join('/');
export const doc = (...parts) => parts.join('/');
export const getDocs = async () => {
  if (!globalThis.notesCloudAvailable) throw new Error('offline');
  return { docs: [] };
};
export const setDoc = async () => {
  if (!globalThis.notesCloudAvailable) throw new Error('offline');
};
export const deleteDoc = setDoc;
`;
const bundle = await build({
  entryPoints: ["src/utils/studentNotes.js"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  plugins: [{ name: "student-notes-storage", setup(builder) {
    builder.onResolve({ filter: /^(firebase\/firestore|\.\/firebase)$/ }, () => ({ path: "storage", namespace: "mock" }));
    builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({ contents: mock, loader: "js" }));
  } }],
});
const notes = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const draft = { id: "note-1", title: "Cells", content: "<p>Revision</p>", createdAt: "2026-09-24T00:00:00.000Z" };
const localSave = await notes.saveStudentNote("student", draft);
assert.equal(localSave.cloudSaved, false);
assert.equal((await notes.listStudentNotes("student")).notes[0].title, "Cells");
notes.setLastStudentNoteId("student", draft.id);
assert.equal(notes.getLastStudentNoteId("student"), draft.id);
globalThis.notesCloudAvailable = true;
assert.equal((await notes.saveStudentNote("student", draft)).cloudSaved, true);
console.log("Passed: student notes save locally during cloud failure, sync when available, and restore the last-opened note.");
