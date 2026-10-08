import { mathLessonGroups } from "./mathLessonGroups.js";
import { mathsSubject } from "./subjectConfig.js";
import { scienceSubjects } from "./scienceCurriculum.js";

const mathsTopics = Object.entries(mathLessonGroups).flatMap(([year, groups]) =>
  groups.map(([id, name]) => ({
    id: `${year}-${id}`,
    name: `Year ${year.slice(-1)}: ${name}`,
    subtopics: [],
  })),
);

export const practiceSubjects = [
  { ...mathsSubject, topics: mathsTopics },
  ...scienceSubjects,
];

export const findPracticeSubject = (subjectId) =>
  practiceSubjects.find((subject) => subject.id === subjectId);

export const findPracticeTopic = (subjectId, topicId) =>
  findPracticeSubject(subjectId)?.topics.find((topic) => topic.id === topicId);
