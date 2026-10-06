import flashcardDecks from "../data/flashcardDecks";
import { scienceSubjects } from "../data/scienceCurriculum";
import { noteSubjects } from "../data/noteSubjects";
import { mathLessons, mathRevisionNoteUrl } from "./mathLessonLibrary";
import { notes } from "./noteLibrary";

const visibleSubjectIds = new Set(["maths", "biology", "chemistry", "physics"]);
const pages = [
  ["Revision notes", "All subjects and study notes", "/notes", "notes"],
  ["Flashcards", "All recall decks", "/flashcards", "flashcards"],
  ["Practice questions", "Tests, quizzes and immediate feedback", "/examquestions", "practice"],
  ["Past papers", "Exam papers and answer files", "/pastpapers", "notes"],
  ["Mock exams", "Timed examination practice", "/mockexams", "practice"],
  ["My courses", "Student dashboard and saved progress", "/launchpad", "notes"],
  ["About StudyForge", "About the platform", "/about", "info"],
  ["Join StudyForge", "Development, design and student ambassador roles", "/join", "account"],
];

const items = [
  ...pages.map(([label, detail, to, icon]) => ({ id: `page-${to}`, label, detail, to, icon, keywords: `${label} ${detail}` })),
  ...noteSubjects.filter((subject) => visibleSubjectIds.has(subject.id)).map((subject) => ({ id: `course-${subject.id}`, label: subject.name, detail: "Course", to: `/subjects/${subject.id}`, icon: "notes", keywords: `${subject.name} ${subject.description}` })),
  ...notes.flatMap((note) => note.sections.map((section) => ({ id: `note-${note.subject}-${note.topic}-${section.id}`, label: section.title, detail: `${note.yearLabel || note.qualification} ${note.subject} · Revision note`, to: `/notes/${note.subject}/${note.topic}/${section.id}`, icon: "notes", keywords: `${note.subject} ${note.title} ${section.title} ${section.source}` }))),
  ...mathLessons.flatMap((lesson) => lesson.sections.map((section) => ({ id: `math-note-${lesson.year}-${lesson.id}-${section.id}`, label: section.title, detail: `${lesson.yearLabel} Maths · Revision note`, to: mathRevisionNoteUrl(lesson, section), icon: "notes", keywords: `maths mathematics ${lesson.yearLabel} ${lesson.title} ${section.title} ${section.body}` }))),
  ...Object.entries(flashcardDecks).flatMap(([subject, decks]) => decks.map((deck) => ({ id: `deck-${subject}-${deck.id}`, label: deck.title, detail: `${subject} · Flashcards`, to: `/flashcards/${subject}/${deck.id}`, icon: "flashcards", keywords: `${subject} ${deck.title} flashcards recall cards` }))),
  ...scienceSubjects.flatMap((subject) => [
    { id: `practice-${subject.id}`, label: `${subject.name} practice`, detail: `${subject.topics.length} chapters · Practice questions`, to: `/examquestions?subject=${subject.id}`, icon: "practice", keywords: `${subject.name} practice questions quiz test ${subject.topics.map((topic) => `${topic.name} ${topic.subtopics.join(" ")}`).join(" ")}` },
    ...subject.topics.map((topic) => ({ id: `practice-${subject.id}-${topic.id}`, label: topic.name, detail: `${subject.name} · Practice chapter`, to: `/practice/${subject.id}/${topic.id}`, icon: "practice", keywords: `${subject.name} ${topic.name} ${topic.subtopics.join(" ")} practice questions quiz test` })),
  ]),
];

const normalise = (value) => value.toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, " ").trim();

export const searchStudyForge = (query) => {
  const term = normalise(query);
  if (!term) return [];
  const words = term.split(" ");
  return items.map((item) => {
    const label = normalise(item.label);
    const haystack = normalise(`${item.label} ${item.detail} ${item.keywords}`);
    if (!words.every((word) => haystack.includes(word))) return null;
    const score = label === term ? 0 : label.startsWith(term) ? 1 : label.includes(term) ? 2 : 3;
    return { ...item, score };
  }).filter(Boolean).sort((a, b) => a.score - b.score || a.label.localeCompare(b.label));
};
