import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

const notesCollection = (uid) => collection(firestore, "users", uid, "notes");
const notesKey = (uid) => `studyforge.student-notes.${uid}`;
const activeKey = (uid) => `studyforge.student-notes.active.${uid}`;
const readLocalNotes = (uid) => {
  try { return JSON.parse(localStorage.getItem(notesKey(uid)) || "[]"); }
  catch { return []; }
};
const writeLocalNotes = (uid, notes) => {
  try { localStorage.setItem(notesKey(uid), JSON.stringify(notes)); return true; }
  catch { return false; }
};
const newestFirst = (notes) => notes.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

export async function listStudentNotes(uid) {
  const local = readLocalNotes(uid);
  try {
    const snapshot = await getDocs(notesCollection(uid));
    const cloud = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const merged = newestFirst([...new Map([...cloud, ...local]
      .sort((a, b) => String(a.updatedAt || "").localeCompare(String(b.updatedAt || "")))
      .map((note) => [note.id, note])).values()]);
    writeLocalNotes(uid, merged);
    await Promise.allSettled(merged.filter((note) => !cloud.some((item) => item.id === note.id)).map((note) => setDoc(doc(firestore, "users", uid, "notes", note.id), {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })));
    return { notes: merged, cloudAvailable: true };
  } catch {
    return { notes: newestFirst(local), cloudAvailable: false };
  }
}

export async function saveStudentNote(uid, note) {
  const saved = {
    title: note.title.trim().slice(0, 120) || "Untitled note",
    content: note.content.slice(0, 300000),
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const result = { id: note.id, ...saved };
  const localSaved = writeLocalNotes(uid, newestFirst([...new Map([...readLocalNotes(uid), result].map((item) => [item.id, item])).values()]));
  if (!localSaved) throw new Error("Browser storage is full or unavailable.");
  try {
    await setDoc(doc(firestore, "users", uid, "notes", note.id), saved);
    return { ...result, cloudSaved: true };
  } catch {
    return { ...result, cloudSaved: false };
  }
}

export async function deleteStudentNote(uid, noteId) {
  writeLocalNotes(uid, readLocalNotes(uid).filter((note) => note.id !== noteId));
  try { await deleteDoc(doc(firestore, "users", uid, "notes", noteId)); return true; }
  catch { return false; }
}

export const getLastStudentNoteId = (uid) => localStorage.getItem(activeKey(uid)) || "";
export const setLastStudentNoteId = (uid, noteId) => {
  try { localStorage.setItem(activeKey(uid), noteId); }
  catch { /* A missing preference only affects which note opens first. */ }
};

export function sanitizeStudentNoteHtml(source) {
  const parsed = new DOMParser().parseFromString(source || "", "text/html");
  const allowed = new Set(["A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "FONT", "H1", "H2", "H3", "HR", "I", "LI", "OL", "P", "PRE", "S", "SPAN", "STRIKE", "STRONG", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL"]);
  const remove = [];
  parsed.body.querySelectorAll("*").forEach((element) => {
    if (!allowed.has(element.tagName)) {
      remove.push(element);
      return;
    }
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const keepLink = element.tagName === "A" && name === "href" && /^(https?:|mailto:)/i.test(attribute.value);
      const keepFont = element.tagName === "FONT" && ["color", "size"].includes(name);
      const keepStyle = name === "style";
      if (!keepLink && !keepFont && !keepStyle) element.removeAttribute(attribute.name);
    });
    if (element.hasAttribute("style")) {
      const safeRules = element.getAttribute("style").split(";").map((rule) => rule.trim()).filter((rule) => /^(color|background-color|font-size|text-align)\s*:/i.test(rule));
      if (safeRules.length) element.setAttribute("style", safeRules.join("; "));
      else element.removeAttribute("style");
    }
    if (element.tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });
  remove.reverse().forEach((element) => {
    if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(element.tagName)) element.remove();
    else element.replaceWith(...element.childNodes);
  });
  return parsed.body.innerHTML;
}
