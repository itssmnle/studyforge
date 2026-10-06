import { scienceSubjects } from "./scienceCurriculum";

export const additionalNoteSubjects = [
  {
    id: "maths",
    name: "Maths",
    qualification: "KS3",
    color: "#7c3aed",
    secondaryColor: "#f3efff",
    description: "Numbers, patterns, proof, and practical problem solving.",
  },
];

export const noteSubjects = [...scienceSubjects, ...additionalNoteSubjects];
export const findNotesSubject = (subjectId) => noteSubjects.find((subject) => subject.id === subjectId);
