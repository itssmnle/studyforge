import { mathLessonCategories, mathLessonGroups } from "../data/mathLessonGroups";

const files = import.meta.glob("../../content/math-lessons/year-*/*.md", { query: "?raw", import: "default", eager: true });
const yearOrder = ["year-7", "year-8", "year-9"];
const yearLabel = year => "Year " + year.slice(-1);
const headingId = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const specs = Object.entries(mathLessonGroups).flatMap(([year, groups]) => groups.map(([id, title, start, end]) => ({ year, id, title, start, end })));

export const mathSectionsFromBody = body => {
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)];
  return headings.map((match, index) => {
    const title = match[1].trim();
    const contentStart = match.index + match[0].length;
    const contentEnd = headings[index + 1]?.index ?? body.length;
    return { title, id: headingId(title), body: body.slice(contentStart, contentEnd).trim() };
  });
};

export const mathLessons = Object.entries(files).map(([path, body]) => {
  const match = path.match(/\/math-lessons\/(year-[789])\/(\d+)-([^/]+)\.md$/);
  if (!match) return null;
  const [, year, number, id] = match;
  const spec = specs.find(item => item.year === year && item.id === id);
  if (!spec) throw new Error("Missing Maths group specification for " + path);
  return {
    id, year, yearLabel: yearLabel(year), number: Number(number), start: spec.start, end: spec.end,
    lessonCount: spec.end - spec.start + 1, title: body.match(/^#\s+(.+)$/m)?.[1]?.trim() || spec.title, body,
    sections: mathSectionsFromBody(body),
  };
}).filter(Boolean).sort((a, b) => yearOrder.indexOf(a.year) - yearOrder.indexOf(b.year) || a.number - b.number);

export const mathCategoriesForYear = (year, lessons = mathLessons) => (mathLessonCategories[year] || []).map(([id, title, lessonIds]) => ({
  id,
  title,
  groups: lessonIds.map(lessonId => lessons.find(lesson => lesson.year === year && lesson.id === lessonId)).filter(Boolean),
}));

export const mathLessonsForYear = year => mathLessons.filter(lesson => lesson.year === year);
export const findMathLesson = (year, id) => mathLessons.find(lesson => lesson.year === year && lesson.id === id);
export const groupForLegacyLesson = (year, id, lessons = mathLessons) => {
  const number = Number(id.slice(0, 3));
  return lessons.find(lesson => lesson.year === year && number >= lesson.start && number <= lesson.end);
};
export const mathLessonUrl = lesson => "/notes/maths/" + lesson.year + "/" + lesson.id;
export const mathLessonGroupUrl = lesson => "/notes/maths/" + lesson.year + "/group/" + lesson.id;
export const mathRevisionNoteUrl = (lesson, section) => mathLessonGroupUrl(lesson) + "/" + section.id;
