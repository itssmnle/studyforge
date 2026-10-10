import { useMemo, useState } from "react";
import { FiEdit2, FiFilePlus, FiFilter, FiTrash2 } from "react-icons/fi";
import { noteSubjects } from "../data/noteSubjects";
import { parseMarkdownNote } from "../utils/noteLibrary";
import { deleteTeacherNote, saveTeacherNote, usePublishedNotes } from "../utils/teacherNotes";

const editableSubjects = noteSubjects.map(subject => subject.id);
const subjectName = id => noteSubjects.find(subject => subject.id === id)?.name || id;
const blankSource = (title, qualification = "KS4") => `---
title: ${title}
summary: A concise summary of this topic.
qualification: ${qualification}
author: kojonote Teaching Team
updated: ${new Date().toISOString().slice(0, 10)}
---

# ${title}

## Key ideas

Write the revision notes here.

## Worked example

Show each step clearly.
`;
const makeTopicId = title => title.toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);

export default function TeacherNotesEditor({ user }) {
  const { notes, mathLessons, overrides, loading, error, refresh } = usePublishedNotes();
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState(() => new Set(editableSubjects));
  const [status, setStatus] = useState("all");
  const [mathYear, setMathYear] = useState("all");
  const allEntries = useMemo(() => [
    ...notes.map(note => ({ kind: "note", subject: note.subject, topic: note.topic, title: note.title, detail: `${note.sections.length} subchapters`, note })),
    ...mathLessons.map(lesson => ({ kind: "maths", subject: "maths", topic: lesson.id, year: lesson.year, title: lesson.title, detail: lesson.yearLabel, lesson })),
  ], [mathLessons, notes]);
  const visibleEntries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("en-GB");
    return allEntries.filter(entry => {
      const overridden = overrides.some(item => item.subject === entry.subject && item.topic === entry.topic && (entry.subject !== "maths" || item.year === entry.year));
      return selectedSubjects.has(entry.subject)
        && (entry.subject !== "maths" || mathYear === "all" || entry.year === mathYear)
        && (status === "all" || (status === "edited" ? overridden : !overridden))
        && (!term || `${entry.title} ${entry.subject} ${entry.detail} ${entry.kind === "note" ? entry.note.body : entry.lesson.body}`.toLocaleLowerCase("en-GB").includes(term));
    });
  }, [allEntries, mathYear, overrides, query, selectedSubjects, status]);

  const toggleSubject = subject => setSelectedSubjects(current => {
    const next = new Set(current);
    if (next.has(subject)) next.delete(subject); else next.add(subject);
    return next;
  });
  const overrideFor = entry => overrides.find(item => item.subject === entry.subject && item.topic === entry.topic && (entry.subject !== "maths" || item.year === entry.year));
  const editEntry = entry => {
    const override = overrideFor(entry);
    if (entry.kind === "maths") setDraft({ kind: "maths", subject: "maths", year: entry.year, topic: entry.topic, source: override?.source || entry.lesson.body });
    else {
      const note = entry.note;
      setDraft({ kind: "note", subject: note.subject, topic: note.topic, source: override?.source || `---
title: ${note.title}
summary: ${note.summary}
qualification: ${note.qualification}
author: ${note.author}
updated: ${note.updated || new Date().toISOString().slice(0, 10)}
---

${note.body}` });
    }
    setMessage("");
  };
  const createNote = () => {
    const title = "New revision note";
    setDraft({ kind: "note", subject: "biology", topic: makeTopicId(title), source: blankSource(title) });
    setMessage("");
  };
  const save = async event => {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      if (draft.kind !== "maths") {
        const parsed = parseMarkdownNote(draft.subject, draft.topic, draft.source);
        if (!parsed.title || !parsed.sections.length) throw new Error("Add a title and at least one ## subchapter heading.");
      }
      await saveTeacherNote(draft, user);
      await refresh(); setDraft(null); setMessage("Published note saved.");
    } catch (saveError) { setMessage(saveError.message); }
    finally { setBusy(false); }
  };
  const remove = async entry => {
    if (!overrideFor(entry) || busy) return;
    setBusy(true); setMessage("");
    try { await deleteTeacherNote(entry, user); await refresh(); setMessage("Teacher edit removed. The original published note is restored."); }
    catch (deleteError) { setMessage(deleteError.message); }
    finally { setBusy(false); }
  };

  return <section className="teacher-notes-editor">
    <div className="section-heading"><div><span className="eyebrow">Published notes</span><h2>Add or edit revision notes</h2><p>Every existing subject is editable here. Maths keeps its year and lesson ID fixed, so a content edit cannot change its learning order.</p></div><button className="platform-button primary" disabled={busy} onClick={createNote}><FiFilePlus /> Add note</button></div>
    <section className="teacher-note-filters" aria-label="Filter published notes"><div className="teacher-filter-heading"><FiFilter /> <strong>Filters</strong><button type="button" onClick={() => { setSelectedSubjects(new Set(editableSubjects)); setStatus("all"); setMathYear("all"); setQuery(""); }}>Clear filters</button></div><label>Search notes<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, content, subject, or year" /></label><label>Publishing status<select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All notes</option><option value="edited">Teacher edited</option><option value="original">Original only</option></select></label><label>Maths year<select value={mathYear} onChange={event => setMathYear(event.target.value)}><option value="all">All years</option><option value="year-7">Year 7</option><option value="year-8">Year 8</option><option value="year-9">Year 9</option></select></label><fieldset><legend>Subjects</legend>{editableSubjects.map(subject => <label key={subject}><input type="checkbox" checked={selectedSubjects.has(subject)} onChange={() => toggleSubject(subject)} /> {subjectName(subject)}</label>)}</fieldset></section>
    {error && <p role="alert" className="teacher-editor-message">{error}</p>}{message && <p role="status" className="teacher-editor-message">{message}</p>}
    {draft && <form className="teacher-note-form" onSubmit={save}><div className="form-grid"><label>Subject<select value={draft.subject} disabled={busy || draft.kind === "maths"} onChange={event => setDraft(current => ({ ...current, subject: event.target.value }))}>{noteSubjects.filter(subject => subject.id !== "maths").map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>{draft.kind === "maths" ? <label>Year and lesson ID<input value={`${draft.year} · ${draft.topic}`} disabled /></label> : <label>Topic ID<input value={draft.topic} disabled={busy} pattern="[a-z0-9-]{2,100}" onChange={event => setDraft(current => ({ ...current, topic: event.target.value.toLocaleLowerCase("en-GB") }))} required /></label>}</div><label>Markdown note<textarea value={draft.source} disabled={busy} onChange={event => setDraft(current => ({ ...current, source: event.target.value }))} required /></label><p className="teacher-note-help">Use frontmatter for title, summary, qualification, author, and updated date. Use <code>##</code> for each subchapter. Maths notation such as <code>$x^2$</code> is supported.</p><div className="form-actions"><button type="button" className="platform-button secondary" disabled={busy} onClick={() => setDraft(null)}>Cancel</button><button className="platform-button primary" disabled={busy}>{busy ? "Publishing…" : "Publish note"}</button></div></form>}
    {loading ? <p role="status">Loading published notes…</p> : <><p className="teacher-note-results">{visibleEntries.length} matching {visibleEntries.length === 1 ? "note" : "notes"}</p><div className="teacher-note-group">{visibleEntries.map(entry => { const overridden = Boolean(overrideFor(entry)); return <article key={`${entry.subject}-${entry.year || ""}-${entry.topic}`}><div><strong>{entry.title}</strong><small>{subjectName(entry.subject)} · {entry.detail}{overridden ? " · teacher edited" : ""}</small></div><button onClick={() => editEntry(entry)} disabled={busy} aria-label={`Edit ${entry.title}`}><FiEdit2 /></button>{overridden && <button className="danger-icon-button" onClick={() => remove(entry)} disabled={busy} aria-label={`Remove teacher edit for ${entry.title}`}><FiTrash2 /></button>}</article>; })}{!visibleEntries.length && <p className="empty-tool-state">No notes match these filters.</p>}</div></>}
  </section>;
}
