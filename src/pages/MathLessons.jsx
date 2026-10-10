import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiChevronDown, FiEdit3, FiSearch } from 'react-icons/fi';
import katex from 'katex';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { NoteProgressNode, TopicProgressRing } from '../components/NoteProgressIndicators';
import NoteStudyFooter from '../components/NoteStudyFooter';
import NoteTopicsToggle from '../components/NoteTopicsToggle';
import { groupForLegacyLesson, mathCategoriesForYear, mathLessonGroupUrl, mathRevisionNoteUrl } from '../utils/mathLessonLibrary';
import { completedCount, noteProgressId, useCompletedNotes } from '../utils/noteProgress';
import { useNoteSidebarVisibility } from '../utils/noteSidebarVisibility';
import { usePublishedNotes } from '../utils/teacherNotes';
import '../styles/MarkdownNotes.css';
import '../styles/MathLessons.css';

const years = ['year-7', 'year-8', 'year-9'];
const subjectStyle = { '--subject-color': 'var(--primary)', '--subject-secondary': 'var(--secondary)' };
const readerSidebarState = {
  expandedCategories: new Set(),
  expandedTopics: new Set(),
  scrollTop: 0,
};
const titleMathPattern = /(\$(?:\\.|[^$\\\n])*\$)/g;
const wrappedTitleMathPattern = /\s*\(\s*\$((?:\\.|[^$\\\n])*)\$\s*([^)]*?)\s*\)/g;

function MathTitleContent({ title, formulaClassName = 'math-sidebar-title-formula' }) {
  const normalisedTitle = title.replace(wrappedTitleMathPattern, (_, formula, suffix) => ` $${formula}${suffix ? `\\text{ ${suffix.trim()} }` : ''}$`);
  return <>{normalisedTitle.split(titleMathPattern).filter(Boolean).map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const html = katex.renderToString(part.slice(1, -1), { throwOnError: false, strict: 'ignore', trust: false, output: 'htmlAndMathml' });
      return <span className={formulaClassName} key={`${part}-${index}`} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  })}</>;
}

function MathLessonTitle({ title }) {
  return <h1 className="math-lesson-title"><MathTitleContent title={title} formulaClassName="math-lesson-title-formula" /></h1>;
}

export function MathLessonIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const requestedYear = searchParams.get('year');
  const [activeYear, setActiveYear] = useState(years.includes(requestedYear) ? requestedYear : 'year-7');
  const [expandedCategories, setExpandedCategories] = useState(() => new Set());
  const [expandedTopics, setExpandedTopics] = useState(() => new Set());
  const { mathLessons } = usePublishedNotes();
  const completedNotes = useCompletedNotes();
  const query = search.trim().toLocaleLowerCase('en-GB');
  const allGroups = mathLessons;
  const grouped = useMemo(() => years.map(year => {
    const all = allGroups.filter(group => group.year === year);
    const visible = query ? all.filter(group => `${group.title} ${group.body}`.toLocaleLowerCase('en-GB').includes(query)) : all;
    return { year, all, visible };
  }), [allGroups, query]);
  const selected = grouped.find(group => group.year === activeYear) || grouped[0];
  const categories = mathCategoriesForYear(activeYear, selected.visible).filter(category => category.groups.length);
  const toggleSetItem = (setter, id) => setter(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const selectYear = year => {
    setActiveYear(year);
    setSearchParams({ year }, { replace: true });
    setExpandedCategories(new Set());
    setExpandedTopics(new Set());
  };

  return <main className="platform-shell subject-notes-page math-lessons-index" style={subjectStyle}>
    <div className="math-index-hero">
      <header><span className="eyebrow">KS3 Maths</span><h1>Maths revision notes</h1><p>Choose your year, then jump straight into a focused topic with methods and worked examples.</p></header>
      <div className="math-index-stat"><strong>{allGroups.length}</strong><span>focused topics<br />across Years 7–9</span></div>
    </div>
    <nav className="math-year-switcher" aria-label="Choose maths year group">
      {grouped.map(({ year, all, visible }) => <button type="button" className={year === activeYear ? 'active' : ''} aria-pressed={year === activeYear} onClick={() => selectYear(year)} key={year}><span>Year {year.slice(-1)}</span><small>{query ? `${visible.length} matches` : `${all.length} topics`}</small></button>)}
    </nav>
    <div className="math-library-toolbar">
      <label className="math-lesson-search"><FiSearch /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search Year ${activeYear.slice(-1)} topics`} aria-label={`Search Year ${activeYear.slice(-1)} maths topics`} /></label>
      <p className="math-lesson-count">Showing {selected.visible.length} of {selected.all.length} Year {activeYear.slice(-1)} topics</p>
    </div>
    <section className="math-topic-browser" aria-label={`Year ${activeYear.slice(-1)} maths topics`}>
      <div className="math-topic-browser-heading"><div><span className="eyebrow">Year {activeYear.slice(-1)}</span><h2>Revision topics</h2></div><span>{selected.all.reduce((total, group) => total + group.sections.length, 0)} notes in {categories.length} groups</span></div>
      <div className="math-category-grid">
        {categories.map((category, categoryIndex) => {
          const categoryOpen = Boolean(query) || expandedCategories.has(category.id);
          const noteCount = category.groups.reduce((total, topic) => total + topic.sections.length, 0);
          const categoryCompleted = category.groups.reduce((total, topic) => total + completedCount(completedNotes, 'maths', topic.id, topic.sections), 0);
          return <section className={`math-category-card${categoryOpen ? ' open' : ''}`} key={category.id}>
            <button type="button" className="math-category-summary" aria-expanded={categoryOpen} onClick={() => toggleSetItem(setExpandedCategories, category.id)}><TopicProgressRing completed={categoryCompleted} total={noteCount} label={category.title} /><span><strong>{categoryIndex + 1}. {category.title}</strong><small>{category.groups.length} {category.groups.length === 1 ? 'topic' : 'topics'} · {noteCount} revision notes</small></span><FiChevronDown /></button>
            <div className="math-library-collapse" aria-hidden={!categoryOpen}><div className="math-library-collapse-inner"><div className="math-category-topics">{category.groups.map(topic => {
              const topicOpen = Boolean(query) || expandedTopics.has(topic.id);
              const topicCompleted = completedCount(completedNotes, 'maths', topic.id, topic.sections);
              return <section className={`math-topic-accordion${topicOpen ? ' open' : ''}`} key={topic.id}><button type="button" aria-expanded={topicOpen} onClick={() => toggleSetItem(setExpandedTopics, topic.id)}><TopicProgressRing completed={topicCompleted} total={topic.sections.length} label={topic.title} /><span><strong>{topic.title}</strong><small>{topic.sections.length} revision {topic.sections.length === 1 ? 'note' : 'notes'}</small></span><FiChevronDown /></button><div className="math-library-topic-collapse" aria-hidden={!topicOpen}><div className="math-library-collapse-inner"><nav aria-label={`${topic.title} revision notes`}>{topic.sections.map(section => <Link to={mathRevisionNoteUrl(topic, section)} key={section.id}><NoteProgressNode completed={completedNotes.has(noteProgressId('maths', topic.id, section.id))} /><span><MathTitleContent title={section.title} /></span><FiArrowRight /></Link>)}</nav></div></div></section>;
            })}</div></div></div>
          </section>;
        })}
        {!categories.length && <div className="math-topic-empty"><FiSearch /><strong>No matching topics</strong><span>Try a broader search or switch year group.</span></div>}
      </div>
    </section>
  </main>;
}

export function MathLessonReader() {
  const { year, lesson: id } = useParams();
  const { mathLessons } = usePublishedNotes();
  const lesson = mathLessons.find(item => item.year === year && item.id === id);
  const group = lesson || groupForLegacyLesson(year, id, mathLessons);
  return group ? <Navigate to={mathLessonGroupUrl(group)} replace /> : <Navigate to="/notes/maths" replace />;
}

export function MathLessonGroupReader() {
  const { year, group: groupId, note: noteId } = useParams();
  const location = useLocation();
  const { mathLessons } = usePublishedNotes();
  const group = mathLessons.find(item => item.year === year && item.id === groupId);
  if (!group) return <Navigate to="/notes/maths" replace />;
  const legacyNoteId = location.hash.slice(1) || group.sections[0]?.id;
  if (!noteId) {
    const legacyNote = group.sections.find(item => item.id === legacyNoteId) || group.sections[0];
    return <Navigate to={legacyNote ? mathRevisionNoteUrl(group, legacyNote) : "/notes/maths"} replace />;
  }
  const requestedNoteId = noteId;
  const revisionNote = group.sections.find(item => item.id === requestedNoteId);
  return revisionNote
    ? <MathLessonGroupContent group={group} groups={mathLessons} year={year} revisionNote={revisionNote} />
    : <Navigate to={group.sections[0] ? mathRevisionNoteUrl(group, group.sections[0]) : "/notes/maths"} replace />;
}

function MathLessonGroupContent({ group, groups, year, revisionNote }) {
  const notePages = groups.filter(item => item.year === year).flatMap(item => item.sections.map(section => ({ group: item, section })));
  const position = notePages.findIndex(item => item.group.id === group.id && item.section.id === revisionNote.id);
  const previous = notePages[position - 1];
  const next = notePages[position + 1];
  const page = item => item && { url: mathRevisionNoteUrl(item.group, item.section), section: { title: item.section.title } };
  const note = { subject: 'maths', topic: group.id };
  const section = { id: group.id };
  const firstGroupForYear = targetYear => groups.find(item => item.year === targetYear);
  const readerCategories = mathCategoriesForYear(year, groups);
  const activeCategory = readerCategories.find(category => category.groups.some(item => item.id === group.id));
  const sidebarContentRef = useRef(null);
  const [expandedReaderCategories, setExpandedReaderCategories] = useState(() => new Set([
    ...readerSidebarState.expandedCategories,
    ...(activeCategory ? [activeCategory.id] : []),
  ]));
  const [expandedReaderTopics, setExpandedReaderTopics] = useState(() => new Set([
    ...readerSidebarState.expandedTopics,
    group.id,
  ]));
  const completedNotes = useCompletedNotes();
  const [topicsHidden, toggleTopicsHidden] = useNoteSidebarVisibility();
  const updateReaderSet = (setter, stateKey, update) => setter(current => {
    const next = update(current);
    readerSidebarState[stateKey] = new Set(next);
    return next;
  });
  const toggleReaderSet = (setter, stateKey, id) => updateReaderSet(setter, stateKey, current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  useLayoutEffect(() => {
    if (activeCategory?.id) {
      updateReaderSet(setExpandedReaderCategories, 'expandedCategories', current => new Set([...current, activeCategory.id]));
    }
    updateReaderSet(setExpandedReaderTopics, 'expandedTopics', current => new Set([...current, group.id]));
  }, [activeCategory?.id, group.id]);
  useLayoutEffect(() => {
    if (sidebarContentRef.current) sidebarContentRef.current.scrollTop = readerSidebarState.scrollTop;
  }, []);
  const rememberSidebarScroll = event => {
    readerSidebarState.scrollTop = event.currentTarget.scrollTop;
  };
  return (
    <main className={`note-reader-shell ks3-note-reader math-lesson-reader${topicsHidden ? ' topics-hidden' : ''}`} style={subjectStyle}>
      <aside className="note-reader-aside">
        <div className="note-reader-aside-heading"><strong>Revision Notes</strong><NoteTopicsToggle hidden={topicsHidden} onToggle={toggleTopicsHidden} /></div>
        <div className="note-reader-aside-content" ref={sidebarContentRef} onScroll={rememberSidebarScroll}>
          <div className="math-reader-title"><Link to="/notes/maths">View all topics <FiArrowRight /></Link></div>
          <span>Switch year</span>
          <nav className="math-reader-year-switcher" aria-label="Switch maths year group">
            {years.map(targetYear => {
              const first = firstGroupForYear(targetYear);
              const firstNote = first?.sections[0];
              return first && firstNote ? <Link className={targetYear === year ? 'active' : ''} aria-current={targetYear === year ? 'true' : undefined} to={targetYear === year ? mathRevisionNoteUrl(group, revisionNote) : mathRevisionNoteUrl(first, firstNote)} key={targetYear}>Y{targetYear.slice(-1)}</Link> : null;
            })}
          </nav>
          <nav className="math-reader-outline" aria-label={`${group.yearLabel} maths revision notes`}>
            {readerCategories.map((category, categoryIndex) => {
              const categoryOpen = expandedReaderCategories.has(category.id);
              const categorySections = category.groups.flatMap(item => item.sections.map(noteSection => ({ topic: item.id, section: noteSection })));
              const categoryCompleted = categorySections.filter(item => completedNotes.has(noteProgressId('maths', item.topic, item.section.id))).length;
              return (
                <section className={`math-reader-category${categoryOpen ? ' open' : ''}`} key={category.id}>
                  <button type="button" aria-expanded={categoryOpen} onClick={() => toggleReaderSet(setExpandedReaderCategories, 'expandedCategories', category.id)}>
                    <TopicProgressRing completed={categoryCompleted} total={categorySections.length} label={category.title} />
                    <span><strong>{categoryIndex + 1}. {category.title}</strong><small>{category.groups.length} {category.groups.length === 1 ? 'subtopic' : 'subtopics'} · {categorySections.length} revision notes</small></span>
                    <FiChevronDown />
                  </button>
                  <div className="math-reader-collapse" aria-hidden={!categoryOpen}><div className="math-reader-collapse-inner">{category.groups.map(item => {
                    const topicOpen = expandedReaderTopics.has(item.id);
                    const topicCompleted = completedCount(completedNotes, 'maths', item.id, item.sections);
                    return (
                      <section className={`math-reader-topic${topicOpen ? ' open' : ''}`} key={item.id}>
                        <button type="button" aria-expanded={topicOpen} onClick={() => toggleReaderSet(setExpandedReaderTopics, 'expandedTopics', item.id)}>
                          <TopicProgressRing completed={topicCompleted} total={item.sections.length} label={item.title} />
                          <span>{item.title}</span>
                          <FiChevronDown />
                        </button>
                        <div className="math-reader-collapse" aria-hidden={!topicOpen}><div className="math-reader-collapse-inner"><div className="math-reader-sections">{item.sections.map(noteSection => {
                          const active = item.id === group.id && noteSection.id === revisionNote.id;
                          const completed = completedNotes.has(noteProgressId('maths', item.id, noteSection.id));
                          return <Link className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} tabIndex={topicOpen ? undefined : -1} to={mathRevisionNoteUrl(item, noteSection)} key={noteSection.id}><NoteProgressNode active={active} completed={completed} /><span className="math-reader-note-title"><MathTitleContent title={noteSection.title} /></span></Link>;
                        })}</div></div></div>
                      </section>
                    );
                  })}</div></div>
                </section>
              );
            })}
          </nav>
        </div>
      </aside>
      <article className="note-reader">
        <header><span className="eyebrow">KS3 · Maths · {group.yearLabel}</span><p className="note-chapter-name">{group.title}</p><MathLessonTitle title={revisionNote.title} /><p>A focused revision note with methods and worked examples.</p><div className="note-metadata"><span><FiEdit3 /> kojonote Maths Team</span></div></header>
        <MarkdownRenderer source={revisionNote.body} glossary="maths" />
        <NoteStudyFooter note={note} section={{ ...section, id: revisionNote.id }} topic={{ id: group.id }} previous={page(previous)} next={page(next)} completeTopic={revisionNote.id === group.sections[group.sections.length - 1]?.id} />
      </article>
    </main>
  );
}
