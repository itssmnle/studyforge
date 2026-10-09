import { mathLessonCategories, mathLessonGroups } from "./mathLessonGroups";
import { findSubject } from "./scienceCurriculum";

const scienceFocus = {
  biology: {
    "year-7": "Cells, organisation and movement",
    "year-8": "Life processes and body systems",
    "year-9": "Foundations for GCSE biology",
  },
  chemistry: {
    "year-7": "Particles, atoms and separation",
    "year-8": "Reactions, patterns and the Periodic Table",
    "year-9": "Matter, atoms and chemical bonding",
  },
  physics: {
    "year-7": "Energy, motion and forces",
    "year-8": "Circuits, sound and light",
    "year-9": "Motion, forces, energy and work",
  },
};

const scienceTopicYear = (topic) => topic.id.match(/^year-(\d)/)?.[1];

const notePath = (subjectId, topicId) => `/notes/${subjectId}/${topicId}`;
const mathsNotePath = (year, group) => `/notes/maths/${year}/group/${group}`;

export const syllabusYears = ["year-7", "year-8", "year-9"];

export const syllabusForSubject = (subjectId, year) => {
  if (subjectId === "maths") {
    const categories = mathLessonCategories[year] || [];
    const groups = new Map((mathLessonGroups[year] || []).map(([id, title]) => [id, title]));
    return {
      focus: {
        "year-7": "Core methods and mathematical fluency",
        "year-8": "Connections across algebra, geometry and data",
        "year-9": "Higher-level methods and GCSE preparation",
      }[year],
      units: categories.map(([id, title, groupIds]) => ({
        id,
        title,
        detail: `${groupIds.length} linked revision topics`,
        topics: groupIds.map((groupId) => ({
          id: groupId,
          title: groups.get(groupId),
          to: mathsNotePath(year, groupId),
        })),
      })),
    };
  }

  const subject = findSubject(subjectId);
  const topics = (subject?.topics || []).filter((topic) => scienceTopicYear(topic) === year.slice(-1));
  return {
    focus: scienceFocus[subjectId]?.[year] || "Key knowledge and practical understanding",
    units: topics.map((topic) => ({
      id: topic.id,
      title: topic.name,
      detail: topic.description || topic.subtopics.join(" · "),
      topics: [{ id: topic.id, title: "Open revision notes", to: notePath(subjectId, topic.id) }],
    })),
  };
};
