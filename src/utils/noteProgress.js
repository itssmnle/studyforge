import { useEffect, useState } from "react";

const STORAGE_KEY = "studyforge.note-progress.v1";
export const NOTE_PROGRESS_EVENT = "studyforge:note-progress";

export const noteProgressId = (subject, topic, section) => `${subject}::${topic}::${section}`;

const readCompletedNotes = () => {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

export const markNotePageComplete = (subject, topic, section) => {
  if (typeof window === "undefined" || !subject || !topic || !section) return;
  const completed = readCompletedNotes();
  const id = noteProgressId(subject, topic, section);
  if (completed.has(id)) return;
  completed.add(id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  window.dispatchEvent(new CustomEvent(NOTE_PROGRESS_EVENT));
};

export const completedCount = (completed, subject, topic, sections) => sections.reduce(
  (total, section) => total + (completed.has(noteProgressId(subject, topic, section.id)) ? 1 : 0),
  0,
);

export function useCompletedNotes() {
  const [completed, setCompleted] = useState(readCompletedNotes);

  useEffect(() => {
    const refresh = () => setCompleted(readCompletedNotes());
    window.addEventListener(NOTE_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NOTE_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return completed;
}

