import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "./firebase";
import { notes, notesWithOverrides } from "./noteLibrary";
import { mathLessons, mathSectionsFromBody } from "./mathLessonLibrary";

const collectionName = "teacherNotes";
const validSubjects = new Set(["biology", "chemistry", "physics", "maths"]);

export const noteDocumentId = (subject, topic, year = "") => subject === "maths" ? `maths--${year}--${topic}` : `${subject}--${topic}`;

export async function listTeacherNotes() {
  const snapshot = await getDocs(collection(firestore, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveTeacherNote(note, user) {
  if (user?.role !== "teacher") throw new Error("Teacher access required.");
  if (!validSubjects.has(note.subject)) throw new Error("Choose a supported subject.");
  if (!/^[a-z0-9-]{2,100}$/.test(note.topic)) throw new Error("Use a lowercase topic ID with letters, numbers, and hyphens only.");
  if (note.subject === "maths" && !/^year-[789]$/.test(note.year || "")) throw new Error("Choose the Maths year group.");
  if (!note.source.trim()) throw new Error("Add the note content before saving.");
  const id = noteDocumentId(note.subject, note.topic, note.year);
  await setDoc(doc(firestore, collectionName, id), {
    subject: note.subject,
    topic: note.topic,
    source: note.source.trim(),
    ...(note.subject === "maths" ? { year: note.year } : {}),
    updatedBy: user.uid,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTeacherNote(note, user) {
  if (user?.role !== "teacher") throw new Error("Teacher access required.");
  await deleteDoc(doc(firestore, collectionName, noteDocumentId(note.subject, note.topic, note.year)));
}

export function usePublishedNotes() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => {
    setLoading(true);
    try {
      setOverrides(await listTeacherNotes());
      setError("");
    } catch {
      setError("The latest teacher note edits could not be loaded.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void refresh(); }, []);
  const mathOverrides = overrides.filter(override => override.subject === "maths");
  const publishedMathLessons = mathLessons.map(lesson => {
    const override = mathOverrides.find(item => item.year === lesson.year && item.topic === lesson.id);
    const title = override?.source.match(/^#\s+(.+)$/m)?.[1]?.trim();
    return override ? { ...lesson, body: override.source, title: title || lesson.title, sections: mathSectionsFromBody(override.source) } : lesson;
  });
  return { notes: notesWithOverrides(overrides), mathLessons: publishedMathLessons, overrides, loading, error, refresh };
}

export const editableNotes = notes.filter((note) => validSubjects.has(note.subject));
