import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiChevronDown, FiEdit3, FiFileText } from "react-icons/fi";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { NoteProgressNode, TopicProgressRing } from "../components/NoteProgressIndicators";
import NoteStudyFooter from "../components/NoteStudyFooter";
import NoteTopicsToggle from "../components/NoteTopicsToggle";
import { findSubject } from "../data/scienceCurriculum";
import { findNotesSubject } from "../data/noteSubjects";
import { flashcardDeckForTopic } from "../utils/flashcardDeckRouting";
import { completedCount, noteProgressId, useCompletedNotes } from "../utils/noteProgress";
import { useNoteSidebarVisibility } from "../utils/noteSidebarVisibility";
import { usePublishedNotes } from "../utils/teacherNotes";
import "../styles/MarkdownNotes.css";
import "../styles/MathLessons.css";

const normalise = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const commonsSearchUrl = (query) => `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json&origin=*`;

function TopicImage({ query, alt }) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(commonsSearchUrl(query), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const page = Object.values(data?.query?.pages || {})[0];
        const imageInfo = page?.imageinfo?.[0];
        if (imageInfo?.thumburl) setImage({ src: imageInfo.thumburl, sourceUrl: imageInfo.descriptionurl || null });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  if (!image) return <div className="topic-image-loading" aria-hidden="true"><span /></div>;
  return <figure className="topic-image"><a href={image.sourceUrl || image.src} target="_blank" rel="noreferrer" title="View image source and licence details"><img src={image.src} alt={alt} loading="lazy" decoding="async" /></a><figcaption>Image from Wikimedia Commons</figcaption></figure>;
}

export default function MarkdownNotePage() {
  const { subject: subjectId, topic: topicId, section: sectionId } = useParams();
  const subject = findNotesSubject(subjectId);
  const scienceSubject = findSubject(subjectId);
  const { notes } = usePublishedNotes();
  const [readerChapterVisibility, setReaderChapterVisibility] = useState({});
  const completedNotes = useCompletedNotes();
  const [topicsHidden, toggleTopicsHidden] = useNoteSidebarVisibility();
  const note = notes.find((item) => item.subject === subjectId && (item.topic === topicId || item.sections.some((section) => section.id === topicId)));
  if (!note) {
    return <main className="platform-shell missing-note"><FiFileText /><h1>Notes not added yet</h1><p>Create <code>content/notes/{subjectId}/{topicId}.md</code> and this page will appear automatically.</p><Link className="platform-button secondary" to={`/notes/${subjectId}`}>Back to notes</Link></main>;
  }

  if (topicId !== note.topic) return <Navigate to={`/notes/${subjectId}/${note.topic}/${topicId}`} replace />;
  if (!sectionId && note.sections.length) return <Navigate to={`/notes/${subjectId}/${topicId}/${note.sections[0].id}`} replace />;
  const sectionIndex = note.sections.findIndex((item) => item.id === sectionId);
  if (sectionIndex === -1) return <Navigate to={`/notes/${subjectId}/${topicId}/${note.sections[0]?.id || ""}`} replace />;

  const section = note.sections[sectionIndex];
  const curriculumTopic = scienceSubject?.topics.find((item) => normalise(item.name) === normalise(note.title));
  const flashcardDeck = curriculumTopic ? flashcardDeckForTopic(subjectId, curriculumTopic.id) : null;
  const sameCourse = (item) => note.year ? item.year === note.year : !item.year;
  const pages = notes.filter((item) => item.subject === subjectId && sameCourse(item)).flatMap((subjectNote) => subjectNote.sections.map((subjectSection) => ({ note: subjectNote, section: subjectSection })));
  const subjectNotes = notes.filter((item) => item.subject === subjectId && sameCourse(item));
  const pageIndex = pages.findIndex((page) => page.note.topic === note.topic && page.section.id === section.id);
  const sectionBody = section.source.replace(/^##\s+.*(?:\n|$)/, "").trim();
  const source = [sectionIndex === 0 ? note.intro : "", sectionBody].filter(Boolean).join("\n\n");
  const isKs3 = subjectId === "maths";
  const needsTopicImage = isKs3 && !source.match(/^!\[[^\]]*\]\([^)]+\)$/m);
  const toggleReaderChapter = (chapterId) => setReaderChapterVisibility((current) => ({
    ...current,
    [chapterId]: !(current[chapterId] ?? chapterId === note.topic),
  }));

  return (
    <main className={`note-reader-shell ks3-note-reader math-lesson-reader science-note-reader${topicsHidden ? " topics-hidden" : ""}`} style={subjectId === "maths" ? { "--subject-color": "var(--primary)", "--subject-secondary": "var(--secondary)" } : { "--subject-color": subject?.color || "var(--primary)", "--subject-secondary": subject?.secondaryColor || "var(--secondary)" }}>
      <aside className="note-reader-aside">
        <div className="note-reader-aside-heading"><strong>Revision Notes</strong><NoteTopicsToggle hidden={topicsHidden} onToggle={toggleTopicsHidden} /></div>
        <div className="note-reader-aside-content">
          <div className="math-reader-title"><Link to={`/notes/${subjectId}`}>View all topics <FiArrowRight /></Link></div>
          {note.year ? <><span>Course</span><nav className="math-reader-year-switcher science-reader-year" aria-label={`${subject?.name || subjectId} course level`}><Link className="active" aria-current="true" to={`/notes/${subjectId}`}>Y9</Link></nav></> : null}
          <nav className="math-reader-outline" aria-label={`${subject?.name || subjectId} revision notes`}>
            {subjectNotes.map((chapter, chapterIndex) => {
              const chapterOpen = readerChapterVisibility[chapter.topic] ?? chapter.topic === note.topic;
              const chapterCompleted = completedCount(completedNotes, subjectId, chapter.topic, chapter.sections);
              return (
                <section className={`math-reader-category${chapterOpen ? " open" : ""}`} key={chapter.topic}>
                  <button type="button" aria-expanded={chapterOpen} onClick={() => toggleReaderChapter(chapter.topic)}>
                    <TopicProgressRing completed={chapterCompleted} total={chapter.sections.length} label={chapter.title} />
                    <span><strong>{chapterIndex + 1}. {chapter.title}</strong><small>{chapter.sections.length} revision {chapter.sections.length === 1 ? "note" : "notes"}</small></span>
                    <FiChevronDown />
                  </button>
                  <div className="math-reader-collapse" aria-hidden={!chapterOpen}><div className="math-reader-collapse-inner"><section className="math-reader-topic open"><div className="math-reader-sections">{chapter.sections.map((chapterSection) => {
                    const active = chapter.topic === note.topic && chapterSection.id === section.id;
                    const completed = completedNotes.has(noteProgressId(subjectId, chapter.topic, chapterSection.id));
                    return <Link className={active ? "active" : ""} aria-current={active ? "page" : undefined} tabIndex={chapterOpen ? undefined : -1} to={`/notes/${subjectId}/${chapter.topic}/${chapterSection.id}`} key={chapterSection.id}><NoteProgressNode active={active} completed={completed} /><span>{chapterSection.title}</span></Link>;
                  })}</div></section></div></div>
                </section>
              );
            })}
          </nav>
        </div>
      </aside>
      <article className="note-reader">
        <header>
          <span className="eyebrow">{note.qualification}{note.yearLabel ? ` · ${note.yearLabel}` : ""} · {subject?.name} · Subchapter {sectionIndex + 1} of {note.sections.length}</span>
          <p className="note-chapter-name">{note.title}</p>
          <h1>{section.title}</h1>
          <p>{note.summary}</p>
          <div className="note-metadata"><span><FiEdit3 /> {note.author}</span>{note.updated && <span><FiCalendar /> Updated {note.updated}</span>}</div>
        </header>
        {needsTopicImage && <TopicImage key={`${subjectId}-${section.id}`} query={`${section.title} ${subject?.name || subjectId}`} alt={`${section.title} revision illustration`} />}
        <MarkdownRenderer source={source} glossary={subjectId === "maths" ? "maths" : "science"} />
        <NoteStudyFooter note={note} section={section} topic={curriculumTopic} flashcardDeck={flashcardDeck} previous={pages[pageIndex - 1]} next={pages[pageIndex + 1]} completeTopic={sectionIndex === note.sections.length - 1} />
      </article>
    </main>
  );
}
