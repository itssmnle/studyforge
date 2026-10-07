import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiMoreHorizontal, FiPlus, FiTrash2 } from 'react-icons/fi';
import { scienceSubjects } from '../data/scienceCurriculum';
import SubjectCard from '../components/SubjectCard';
import { getScienceQuestions } from '../data/scienceQuestions';
import { deletePrivatePractice, getPrivatePractice } from '../utils/progressStorage';
import { buildTestQuestions, difficultyFor, filterTestQuestions, saveTestDraft, subchapterKey, typeLabels } from '../utils/practiceTests';
import practiceTestsArt from '../assets/page-heroes/practice-tests.png';
import { useAuthModal } from '../context/AuthModalContext';
import '../styles/Platform.css';
import '../styles/StudyWorkspace.css';
import '../styles/ResourcePageHero.css';

export default function PracticeLibrary() {
  const [params, setParams] = useSearchParams();
  const mathsRequested = params.get('subject') === 'maths';
  const mathsYear = params.get('year');
  const subject = scienceSubjects.find(item => item.id === params.get('subject'));
  const stage = params.get('step');
  const navigate = useNavigate();
  const { user, openLogin } = useAuthModal();
  const [selected, setSelected] = useState([]);
  const [types, setTypes] = useState(Object.keys(typeLabels));
  const [difficulties, setDifficulties] = useState(['Easy', 'Medium', 'Hard']);
  const [minutes, setMinutes] = useState(20);
  const [timer, setTimer] = useState(false);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState(null);
  const [, setHistoryRevision] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const allQuestions = getScienceQuestions();
  const questions = allQuestions.filter(question => question.subject === subject?.id);
  const history = user ? getPrivatePractice().filter(item => !subject || item.subject === subject.id).sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)) : [];
  const subchapters = topic => [...new Set([...topic.subtopics, ...questions.filter(q => q.topic === topic.id).map(q => q.subtopic)])];
  const matching = filterTestQuestions(questions, selected, types, difficulties);
  const toggle = (value, values, setter) => setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  const startBuilder = () => { setSelected([]); setTitle(''); setParams({ subject: subject.id, step: 'topics' }); };
  const launch = () => {
    const chosen = buildTestQuestions(matching, minutes);
    if (!chosen.length) return;
    const id = saveTestDraft({ title: title.trim() || `${subject.name} target test`, subject: subject.id, questions: chosen, minutes, timer, topics: [...new Set(chosen.map(q => q.subtopic))], types: [...new Set(chosen.map(q => q.type))], difficulties: [...new Set(chosen.map(difficultyFor))] });
    navigate(`/practice/${subject.id}/${chosen[0].topic}?test=${id}&mode=test`, { state: { returnTo: `/examquestions?subject=${subject.id}`, builder: true } });
  };
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deletePrivatePractice(deleteTarget.id);
      setHistoryRevision(value => value + 1);
      setDeleteTarget(null);
      setOpenMenuId(null);
    } catch {
      setDeleteError('This test could not be deleted. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };
  if (mathsRequested) return <main className="platform-shell practice-library maths-practice-placeholder">
    <Link className="back-link" to="/subjects/maths"><FiArrowLeft /> Maths overview</Link>
    <header className="workspace-heading"><div><span className="eyebrow">KS3 Maths{mathsYear ? ` · Year ${mathsYear.slice(-1)}` : ''}</span><h1>Maths quiz</h1><p>The quiz link is ready. Questions can be added here later without changing the dashboard course layout.</p></div></header>
    <section className="practice-placeholder-card">
      <div><strong>Quiz content coming later</strong><p>Use the existing revision notes now, then return here when the Maths question bank is available.</p></div>
      <Link className="platform-button primary" to={`/notes/maths${mathsYear ? `?year=${mathsYear}` : ''}`}>Open revision notes <FiArrowRight /></Link>
    </section>
  </main>;

  return <main className="platform-shell practice-library">
    {subject && (stage ? <button className="back-link" onClick={() => setParams({ subject: subject.id })}><FiArrowLeft /> Back to practice</button> : <Link className="back-link" to={`/subjects/${subject.id}`}><FiArrowLeft /> Course Resources</Link>)}
    {!subject ? <><header className="workspace-heading resource-page-hero"><div className="resource-page-hero-copy"><span className="eyebrow">Independent practice</span><h1>Practice tests</h1><p>Choose a subject, then a chapter or create a test built around the topics you want to improve.</p></div><img className="resource-page-hero-art" src={practiceTestsArt} alt="Preview of a personalised StudyForge practice test" /></header><section className="subject-card-grid" aria-label="Practice test subjects">{scienceSubjects.map(item => <SubjectCard subject={item} to={`/examquestions?subject=${item.id}`} metadata={`${item.topics.length} chapters · ${allQuestions.filter(q => q.subject === item.id).length} questions`} key={item.id} />)}</section></> : stage ? <>
      <header className="builder-heading"><span className="eyebrow">{subject.name} · Step {stage === 'topics' ? 1 : 2} of 2</span><h1>{stage === 'topics' ? 'Choose your topics' : 'Personalise your test'}</h1><p>{stage === 'topics' ? 'Open a chapter to choose subchapters, or tick the chapter to select all of them.' : 'Choose question types, difficulty and test length.'}</p></header>
      {stage === 'topics' ? <section className="chapter-selector">{subject.topics.map((topic,index) => {
        const keys = subchapters(topic).map(sub => subchapterKey(topic.id, sub));
        const count = keys.filter(key => selected.includes(key)).length;
        return <div className="chapter-select-row" key={topic.id}><input aria-label={`Select all of ${topic.name}`} type="checkbox" checked={count === keys.length} ref={node => { if (node) node.indeterminate = count > 0 && count < keys.length; }} onChange={() => setSelected(count === keys.length ? selected.filter(key => !keys.includes(key)) : [...new Set([...selected, ...keys])])} /><details><summary>Chapter {index + 1}. {topic.name}<small>{questions.filter(q => q.topic === topic.id).length} questions</small></summary><div className="subchapter-list">{subchapters(topic).map(sub => <label key={sub}><input type="checkbox" checked={selected.includes(subchapterKey(topic.id, sub))} onChange={() => toggle(subchapterKey(topic.id, sub), selected, setSelected)} />{sub}<small>{questions.filter(q => q.topic === topic.id && q.subtopic === sub).length}</small></label>)}</div></details></div>;
      })}</section> : <div className="test-personalisation"><section><label>Test name<input value={title} maxLength={120} placeholder={`${subject.name} target test`} onChange={event => setTitle(event.target.value)} /></label></section><section><h2>Question type</h2><p>Select at least one question type.</p><div className="choice-chips">{Object.entries(typeLabels).map(([value,label]) => <button key={value} aria-pressed={types.includes(value)} disabled={!questions.some(q => selected.includes(subchapterKey(q.topic,q.subtopic)) && q.type === value)} onClick={() => toggle(value,types,setTypes)}>{label} {types.includes(value) ? '✓' : '+'}</button>)}</div></section><section><h2>Question difficulty</h2><div className="choice-chips">{['Easy','Medium','Hard'].map(value => <button key={value} aria-pressed={difficulties.includes(value)} onClick={() => toggle(value,difficulties,setDifficulties)}>{value} {difficulties.includes(value) ? '✓' : '+'}</button>)}</div></section><section><h2>Test length</h2><label>{minutes} minutes<input type="range" min="5" max="120" step="5" value={minutes} onChange={event => setMinutes(Number(event.target.value))} /></label><p>{matching.length} matching questions available. The test may be shorter where the question bank is limited.</p></section><section><h2>Timer</h2><label className="inline-check"><input type="checkbox" checked={timer} onChange={event => setTimer(event.target.checked)} /> Show countdown timer</label></section></div>}
      <footer className="builder-footer">{stage === 'topics' ? <button className="platform-button primary" disabled={!selected.length} onClick={() => setParams({ subject:subject.id, step:'settings' })}>Continue <FiArrowRight /></button> : <><button className="platform-button secondary" onClick={() => setParams({ subject:subject.id, step:'topics' })}>Back to topics</button><button className="platform-button primary" disabled={!matching.length} onClick={launch}>Launch test <FiArrowRight /></button></>}</footer>
    </> : <><header className="workspace-heading"><div><span className="eyebrow">{subject.name}</span><h1>Target tests</h1><p>Build a test or practise a chapter. You can answer questions and see feedback without an account.</p></div><button className="platform-button primary" onClick={startBuilder}><FiPlus /> Create new test</button></header>{user ? <><h2>Practice history</h2><div className="test-history-grid">{history.map(item => <article key={item.id}><div className="history-card-menu"><button aria-label={`More options for ${item.testTitle || item.topicName}`} aria-expanded={openMenuId === item.id} onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}><FiMoreHorizontal /></button>{openMenuId === item.id && <div role="menu"><button role="menuitem" onClick={() => { setDeleteTarget(item); setDeleteError(''); setOpenMenuId(null); }}><FiTrash2 /> Delete test</button></div>}</div><strong className="history-score">{item.correct}/{item.total}</strong><h3>{item.testTitle || item.topicName}</h3><p>{new Date(item.completedAt).toLocaleString()}</p><div className="history-tags">{(item.testTopics || [item.topicName]).map(topic => <span key={topic}>{topic}</span>)}</div><p>{item.score}% correct</p><button className="platform-button secondary" onClick={() => setReview(item)}>Review answers <FiArrowRight /></button></article>)}<button className="new-test-tile" onClick={startBuilder}><FiPlus /><span>Create new test</span></button></div>{!history.length && <p>Your completed practice sessions will appear here.</p>}</> : <aside className="privacy-banner"><div><strong>Guest practice is not saved.</strong><p>Try any chapter below. Create an account only when you want a private practice history.</p></div><button className="platform-button secondary" onClick={() => openLogin('register')}>Create account to save progress</button></aside>}<h2>Practice by chapter</h2><div className="practice-chapters">{subject.topics.map((topic,index) => { const count = questions.filter(q => q.topic === topic.id).length; return <article key={topic.id}><span>Chapter {index + 1}</span><div><h3>{topic.name}</h3><p>{topic.subtopics.join(' · ')}</p></div>{count ? <Link className="platform-button secondary" to={`/practice/${subject.id}/${topic.id}`} state={{ returnTo: `/examquestions?subject=${subject.id}` }}>Practise ({count})</Link> : <small>Questions coming soon</small>}</article>; })}</div></>}
    {review && <div className="course-editor-backdrop"><section className="history-review-dialog" role="dialog" aria-modal="true" aria-label="Practice answer history"><header><h2>{review.testTitle || review.topicName}</h2><button className="platform-button secondary" onClick={() => setReview(null)}>Close</button></header>{review.responses?.map((response,index) => <article key={response.questionId}><h3>{index + 1}. {response.prompt}</h3><p>Your answer: {response.answer || 'No answer'}</p><p>Correct answer: {String(response.correctAnswer)}</p><strong>{response.correct ? 'Correct' : 'Incorrect'}</strong>{response.selfMarked && <small> · Self-marked</small>}</article>)}</section></div>}
    {deleteTarget && <div className="course-editor-backdrop" onMouseDown={() => !deleting && setDeleteTarget(null)}><section className="delete-history-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-history-title" onMouseDown={event => event.stopPropagation()}><FiTrash2 /><h2 id="delete-history-title">Delete this test?</h2><p><strong>{deleteTarget.testTitle || deleteTarget.topicName}</strong> and its saved answers will be permanently removed from your practice history.</p>{deleteError && <p className="delete-history-error" role="alert">{deleteError}</p>}<footer><button className="platform-button secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="platform-button danger" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting...' : 'Delete test'}</button></footer></section></div>}
  </main>;
}
