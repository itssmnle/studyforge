import { splitNoteIntoSections } from "./noteSections";

const markdownFiles = import.meta.glob("../../content/notes/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const scienceLessonFiles = import.meta.glob("../../content/science-lessons/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const subjectReadmeOrders = Object.entries(markdownFiles).reduce((orders, [path, source]) => {
  const match = path.match(/\/notes\/([^/]+)\/README\.md$/i);
  if (!match) return orders;
  const subject = match[1];
  orders[subject] = source
    .split("\n")
    .map((line) => line.match(/^\s*\d+\.\s+(.+?)\s*$/)?.[1])
    .filter(Boolean);
  return orders;
}, {});

const subjectSequence = ["biology", "chemistry", "physics", "maths"];
const subjectRank = (subject) => {
  const index = subjectSequence.indexOf(subject);
  return index === -1 ? subjectSequence.length : index;
};

const noteOrder = (note) => {
  const order = subjectReadmeOrders[note.subject] || [];
  const index = order.findIndex((title) => title.toLocaleLowerCase() === note.title.toLocaleLowerCase());
  return index === -1 ? order.length : index;
};

export const parseFrontmatter = (source) => {
  if (!source.startsWith("---\n")) return { metadata: {}, body: source };
  const closingIndex = source.indexOf("\n---\n", 4);
  if (closingIndex === -1) return { metadata: {}, body: source };

  const metadata = {};
  source.slice(4, closingIndex).split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    metadata[key] = value;
  });
  return { metadata, body: source.slice(closingIndex + 5).trim() };
};

export const parseMarkdownNote = (subject, topic, source, path = "") => {
  const { metadata, body } = parseFrontmatter(source);
  const parsedSections = splitNoteIntoSections(body);
  const sourceTitle = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const isKs3Subject = subject === "maths";
  return {
    subject,
    topic,
    title: metadata.title || sourceTitle || topic.replaceAll("-", " "),
    summary: metadata.summary || `${isKs3Subject ? "KS3" : "KS4"} revision notes for this topic.`,
    qualification: metadata.qualification || (isKs3Subject ? "KS3" : "KS4"),
    author: metadata.author || "Kojonote",
    updated: metadata.updated || "",
    body,
    intro: parsedSections.intro,
    sections: parsedSections.sections,
    path,
  };
};

const sourceNotes = Object.entries(markdownFiles)
  .map(([path, source]) => {
    const match = path.match(/\/notes\/([^/]+)\/([^/]+)\.md$/);
    if (!match) return null;
    const [, subject, topic] = match;
    if (topic.toLocaleLowerCase() === "readme") return null;
    return parseMarkdownNote(subject, topic, source, path);
  })
  .filter(Boolean)
  .sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject) || noteOrder(a) - noteOrder(b) || a.title.localeCompare(b.title));

const titleFromLessonSlug = (slug) => slug
  .replace(/^year-\d+-/i, "")
  .replace(/^[a-z]+\d+[a-z]?-/i, "")
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const year9ScienceNotes = Object.entries(scienceLessonFiles)
  .map(([path, source]) => {
    const match = path.match(/\/science-lessons\/(year-\d+)\/([^/]+)\/([^/]+)\.md$/);
    if (!match) return null;
    const [, year, subject, topic] = match;
    const parsedSections = splitNoteIntoSections(source);
    return {
      subject,
      topic,
      title: titleFromLessonSlug(topic),
      summary: `Verified Year ${year.slice(-1)} revision notes for this topic.`,
      qualification: "KS3",
      year,
      yearLabel: `Year ${year.slice(-1)}`,
      verified: true,
      lessonOrder: Number(topic.match(/^[a-z]+(\d+)/i)?.[1] || 0),
      author: "Kojonote Science Team",
      updated: "",
      body: source,
      intro: parsedSections.intro,
      sections: parsedSections.sections,
      path,
    };
  })
  .filter(Boolean)
  .sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject) || a.topic.localeCompare(b.topic, "en", { numeric: true }));

// Each imported KS3 file is one actual subtopic. Its internal headings stay
// together on that page, just as explanatory headings do in the science notes.
const ks3Groups = new Map();
const cleanTitle = (title) => title.replace(/^\s*[.·]+\s*/, "");
sourceNotes.filter((note) => note.subject === "maths")
  .sort((a, b) => a.topic.localeCompare(b.topic, "en", { numeric: true }))
  .forEach((note) => {
    const chapter = note.body.match(/\*\*KS3 topic:\*\*\s*(.+)/)?.[1]?.trim();
    if (!chapter) throw new Error(`Missing KS3 chapter for ${note.path}`);
    const number = Number(chapter.match(/^\d+/)?.[0]);
    const title = cleanTitle(chapter.replace(/^\d+\.\s*/, ""));
    const key = `${note.subject}-${number}`;
    if (!ks3Groups.has(key)) ks3Groups.set(key, {
      ...note, topic: `chapter-${number}`, title, chapterNumber: number,
      summary: `Explore ${title.charAt(0).toLowerCase()}${title.slice(1)} through focused revision subtopics.`,
      intro: "", body: "", sections: [],
    });
    const group = ks3Groups.get(key);
    const subtopicTitle = cleanTitle(note.title);
    const content = note.body.replace(/^#\s+.*\n/m, "")
      .replace(/^> \*\*(?:Subject|KS3 topic):\*\*.*\n/gm, "")
      .replace(/\*\*\.\s+/g, "**").trim();
    group.sections.push({ id: note.topic, title: subtopicTitle, source: `## ${subtopicTitle}\n\n${content}` });
    group.body = group.sections.map((section) => section.source).join("\n\n");
  });

export const notes = [...sourceNotes.filter((note) => note.subject !== "maths"), ...year9ScienceNotes, ...ks3Groups.values()]
  .sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject) || (a.chapterNumber || a.lessonOrder || 0) - (b.chapterNumber || b.lessonOrder || 0) || noteOrder(a) - noteOrder(b));

export const findMarkdownNote = (subject, topic) => notes.find((note) => note.subject === subject && (note.topic === topic || note.sections.some((section) => section.id === topic)));
export const notesForSubject = (subject) => notes.filter((note) => note.subject === subject);

// Teacher edits are runtime overrides. They intentionally cover the shared
// science note library; Maths remains file-backed because its lessons are
// ordered by year and lesson number.
export const notesWithOverrides = (overrides = []) => {
  const parsed = overrides
    .filter((override) => override.subject !== "maths" && override.source)
    .map((override) => parseMarkdownNote(override.subject, override.topic, override.source, `firestore://teacherNotes/${override.id || `${override.subject}--${override.topic}`}`));
  const overridden = new Set(parsed.map((note) => `${note.subject}/${note.topic}`));
  return [...notes.filter((note) => !overridden.has(`${note.subject}/${note.topic}`)), ...parsed]
    .sort((a, b) => subjectRank(a.subject) - subjectRank(b.subject) || (a.chapterNumber || a.lessonOrder || 0) - (b.chapterNumber || b.lessonOrder || 0) || noteOrder(a) - noteOrder(b) || a.title.localeCompare(b.title));
};
