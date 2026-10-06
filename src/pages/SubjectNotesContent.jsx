import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowRight, FiChevronDown, FiSearch } from "react-icons/fi";
import { NoteProgressNode, TopicProgressRing } from "../components/NoteProgressIndicators";
import { findNotesSubject } from "../data/noteSubjects";
import { completedCount, noteProgressId, useCompletedNotes } from "../utils/noteProgress";
import { usePublishedNotes } from "../utils/teacherNotes";
import "../styles/MarkdownNotes.css";
import "../styles/MathLessons.css";

export default function SubjectNotesContent() {
  const { id } = useParams();
  const subject = findNotesSubject(id);
  const { notes } = usePublishedNotes();
  const completedNotes = useCompletedNotes();
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("year-9");
  const [expandedChapters, setExpandedChapters] = useState(() => new Set());
  const query = search.trim().toLocaleLowerCase("en-GB");
  const allSubjectNotes = useMemo(() => notes.filter((note) => note.subject === id), [id, notes]);
  const hasYear9 = allSubjectNotes.some((note) => note.year === "year-9");
  const effectiveLevel = hasYear9 ? activeLevel : "ks4";
  const subjectNotes = useMemo(() => allSubjectNotes.filter((note) => effectiveLevel === "year-9" ? note.year === "year-9" : !note.year), [effectiveLevel, allSubjectNotes]);
  const visibleNotes = useMemo(() => query
    ? subjectNotes.filter((note) => `${note.title} ${note.summary} ${note.sections.map((section) => section.title).join(" ")}`.toLocaleLowerCase("en-GB").includes(query))
    : subjectNotes, [query, subjectNotes]);

  if (!subject) return <Navigate to="/notes" replace />;

  const subchapterCount = subjectNotes.reduce((total, note) => total + note.sections.length, 0);
  const toggleChapter = (topic) => setExpandedChapters((current) => {
    const next = new Set(current);
    if (next.has(topic)) next.delete(topic); else next.add(topic);
    return next;
  });
  const subjectStyle = { "--subject-color": subject.color, "--subject-secondary": subject.secondaryColor };

  return (
    <main className="platform-shell subject-notes-page math-lessons-index science-notes-index" style={subjectStyle}>
      <div className="math-index-hero">
        <header>
          <span className="eyebrow">{effectiveLevel === "year-9" ? "Year 9" : subject.qualification}{["biology", "chemistry", "physics"].includes(subject.id) ? " Science" : ""}</span>
          <h1>{subject.name} revision notes</h1>
          <p>Choose a chapter, then open a focused subchapter with clear explanations and examples.</p>
        </header>
        <div className="math-index-stat"><strong>{subchapterCount}</strong><span>revision notes<br />across {subjectNotes.length} chapters</span></div>
      </div>

      {hasYear9 ? <nav className="math-year-switcher science-year-switcher" aria-label={`Choose ${subject.name} course level`}>
        <button type="button" className={activeLevel === "year-9" ? "active" : ""} aria-pressed={activeLevel === "year-9"} onClick={() => { setActiveLevel("year-9"); setExpandedChapters(new Set()); }}><span>Year 9</span><small>{allSubjectNotes.filter((note) => note.year === "year-9").length} topics</small></button>
        <button type="button" className={activeLevel === "ks4" ? "active" : ""} aria-pressed={activeLevel === "ks4"} onClick={() => { setActiveLevel("ks4"); setExpandedChapters(new Set()); }}><span>KS4</span><small>{allSubjectNotes.filter((note) => !note.year).length} topics</small></button>
      </nav> : null}

      <div className="math-library-toolbar science-notes-toolbar">
        <label className="math-lesson-search"><FiSearch /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${subject.name} topics`} aria-label={`Search ${subject.name} revision notes`} /></label>
        <p className="math-lesson-count">Showing {visibleNotes.length} of {subjectNotes.length} chapters</p>
      </div>

      <section className="math-topic-browser" aria-label={`${subject.name} revision topics`}>
        <div className="math-topic-browser-heading">
          <div><span className="eyebrow">{effectiveLevel === "year-9" ? "Year 9" : subject.name}</span><h2>Revision topics</h2></div>
          <span>{subchapterCount} notes in {subjectNotes.length} chapters</span>
        </div>
        <div className="math-category-grid">
          {visibleNotes.map((note, chapterIndex) => {
            const chapterOpen = Boolean(query) || expandedChapters.has(note.topic);
            const chapterCompleted = completedCount(completedNotes, id, note.topic, note.sections);
            return (
              <section className={`math-category-card${chapterOpen ? " open" : ""}`} key={note.topic}>
                <button type="button" className="math-category-summary" aria-expanded={chapterOpen} onClick={() => toggleChapter(note.topic)}>
                  <TopicProgressRing completed={chapterCompleted} total={note.sections.length} label={note.title} />
                  <span><strong>{chapterIndex + 1}. {note.title}</strong><small>{note.sections.length} revision {note.sections.length === 1 ? "note" : "notes"}</small></span>
                  <FiChevronDown />
                </button>
                <div className="math-library-collapse" aria-hidden={!chapterOpen}><div className="math-library-collapse-inner">
                  <div className="math-category-topics">
                    <section className="math-topic-accordion open science-note-accordion">
                      <nav aria-label={`${note.title} revision notes`}>
                        {note.sections.map((section) => <Link to={`/notes/${id}/${note.topic}/${section.id}`} key={section.id}><NoteProgressNode completed={completedNotes.has(noteProgressId(id, note.topic, section.id))} /><span>{section.title}</span><FiArrowRight /></Link>)}
                      </nav>
                    </section>
                  </div>
                </div></div>
              </section>
            );
          })}
          {!visibleNotes.length ? <div className="math-topic-empty"><FiSearch /><strong>No matching topics</strong><span>Try a broader search.</span></div> : null}
        </div>
      </section>
    </main>
  );
}
