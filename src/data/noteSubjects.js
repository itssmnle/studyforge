import { scienceSubjects } from "./scienceCurriculum";
import { mathsSubject } from "./subjectConfig";

export const additionalNoteSubjects = [mathsSubject];

export const noteSubjects = [...scienceSubjects, ...additionalNoteSubjects];
export const findNotesSubject = (subjectId) => noteSubjects.find((subject) => subject.id === subjectId);
