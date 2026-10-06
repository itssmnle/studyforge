import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { FiBookOpen, FiCheck, FiLayers, FiLock, FiTarget } from 'react-icons/fi';
import { useAuthModal } from '../context/AuthModalContext';
import { findSubject } from '../data/scienceCurriculum';
import { questionsForTopic } from '../data/scienceQuestions';
import { notesForSubject } from '../utils/noteLibrary';
import { flashcardDeckForTopic } from '../utils/flashcardDeckRouting';
import { masteryKey, masteryLabel, PASS_SCORE, saveCourseMastery, unitUnlocked, useCourseMastery } from '../utils/courseMastery';
import Confetti from '../components/Confetti';
import { completeFlow, startFlow } from '../utils/analytics';
import '../styles/CourseUnit.css';

export default function CourseUnit() {
  const { subject: subjectId, topic: topicId } = useParams();
  const location = useLocation();
  const { user, openLogin } = useAuthModal();
  const mastery = useCourseMastery(user?.uid);
  const subject = findSubject(subjectId);
  const topic = subject?.topics.find(item => item.id === topicId);
  if (!subject || !topic) return <Navigate to="/subjects/maths" replace />;
  const visibleMastery = user ? mastery : { records: {}, ready: true, error: '' };
  return <UnitContent key={`${subjectId}/${topicId}`} subject={subject} topic={topic} user={user} openLogin={openLogin} mastery={visibleMastery} returnedFromNotes={Boolean(location.state?.notesRead)} />;
}

function UnitContent({ subject, topic, user, openLogin, mastery, returnedFromNotes }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [resultSaved, setResultSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [guestNotesRead] = useState(() => returnedFromNotes || sessionStorage.getItem(`studyforge.guest-notes.${subject.id}.${topic.id}`) === 'true');
  const migratedGuestScore = useRef(false);
  const index = subject.topics.findIndex(item => item.id === topic.id);
  const record = mastery.records[masteryKey(subject.id, topic.id)];
  const unlocked = !user || unitUnlocked(subject.topics, index, mastery.records, subject.id);
  const note = notesForSubject(subject.id).find(item => item.title.toLowerCase() === topic.name.toLowerCase());
  const flashcardDeck = flashcardDeckForTopic(subject.id, topic.id);
  const mastered = subject.topics.filter(item => mastery.records[masteryKey(subject.id, item.id)]?.bestScore >= PASS_SCORE).length;
  const flowId = `${subject.id}/${topic.id}`;
  useEffect(() => startFlow('lesson', flowId, 'lesson-opened', `/learn/${flowId}`), [flowId]);
  useEffect(() => {
    if (!user || result === null || resultSaved || migratedGuestScore.current) return;
    migratedGuestScore.current = true;
    setSaving(true);
    setError('');
    saveCourseMastery(user.uid, subject.id, topic.id, result)
      .then(() => setResultSaved(true))
      .catch(() => {
        migratedGuestScore.current = false;
        setError('Your result could not be saved. Check your connection and try again.');
      })
      .finally(() => setSaving(false));
  }, [result, resultSaved, subject.id, topic.id, user]);
  const save = async (score) => {
    setSaving(true); setError('');
    try {
      if (!user) return true;
      await saveCourseMastery(user.uid, subject.id, topic.id, score);
      return true;
    }
    catch { setError('Your progress could not be saved. Check your connection and try again.'); return false; }
    finally { setSaving(false); }
  };
  const startQuiz = () => {
    const pool = questionsForTopic(subject.id, topic.id).filter(q => q.type === 'multiple-choice');
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    migratedGuestScore.current = false;
    setQuiz(pool.slice(0, user ? 10 : 5)); setAnswers({}); setResult(null); setResultSaved(false); setError('');
    startFlow('practice', flowId, 'question-1', `/learn/${flowId}`);
  };
  const submit = async event => {
    event.preventDefault();
    const score = Math.round(100 * quiz.filter(q => answers[q.id] === q.answer).length / quiz.length);
    if (await save(score)) {
      setResultSaved(Boolean(user));
      completeFlow('practice', flowId, 'practice_completion', { subject: subject.id, topic: topic.id, questions: quiz.length, score });
      setResult(score);
    }
  };
  return <main className="academy-dashboard course-hub-page" style={{ '--subject-color': subject.color }}>
    <section className="profile-band course-hub-band">
      <div className="profile-band-inner">
        <div className="profile-avatar">{subject.name.slice(0, 1)}</div>
        <div className="profile-copy"><span className="eyebrow">KS4 Science</span><h1>{subject.name}</h1><p>{subject.topics.length} units · {mastered} proficient</p></div>
        <Link className="outline-action" to={user ? "/launchpad" : `/subjects/${subject.id}`}>{user ? 'Dashboard' : 'Subject'}</Link>
      </div>
    </section>
    <div className="dashboard-layout course-hub-layout">
      <aside className="dashboard-sidebar course-hub-sidebar">
        <span>{subject.name} course</span>
        {subject.topics.map((item, i) => {
          const available = !user || (mastery.ready && !mastery.error && unitUnlocked(subject.topics, i, mastery.records, subject.id));
          const status = available ? masteryLabel(mastery.records[masteryKey(subject.id, item.id)]) : 'Locked';
          return available
            ? <Link className={item.id === topic.id ? 'active' : ''} aria-current={item.id === topic.id ? 'page' : undefined} key={item.id} to={`/learn/${subject.id}/${item.id}`}><span className="course-sidebar-number">{i + 1}</span><span><strong>{item.name}</strong><small>{status}</small></span></Link>
            : <div className="course-sidebar-locked" key={item.id}><FiLock /><span><strong>{item.name}</strong><small>{status}</small></span></div>;
        })}
      </aside>
      <section className="course-workspace course-unit-main">
        <header className="workspace-heading course-unit-heading"><div><span className="workspace-kicker">{subject.name} · Chapter {index + 1}</span><h2>{topic.name}</h2></div></header>
        <div className="unit-mastery"><strong>{record?.bestScore || 0}% practice score · {masteryLabel(record)}</strong><progress aria-label="Unit mastery" max="100" value={record?.bestScore || 0} /><span>Familiar: notes completed · Proficient: 80% · Mastered: 100%</span></div>
      {!mastery.ready ? <p role="status">Loading your progress…</p> : mastery.error ? <p role="alert">{mastery.error}</p> : !unlocked ? <section className="unit-panel"><FiLock /><h2>Complete the earlier units first</h2><p>Score at least {PASS_SCORE}% on each preceding quiz to unlock this unit.</p></section> : <>
        <section className="course-unit-summary"><div className="course-section-heading"><div><span>Unit overview</span><h3>About this unit</h3></div><small>{topic.subtopics.length} focus areas</small></div><p>{note?.summary || topic.subtopics.join(', ')}</p><div className="unit-skill-tags">{topic.subtopics.map(item => <span key={item}>{item}</span>)}</div></section>
        {error && <p role="alert">{error}</p>}
        {!quiz && <section className="unit-learning-path" aria-label="Unit learning path">
          <div className="course-section-heading"><div><span>Your path</span><h3>Learn and practise</h3></div></div>
          <div className="learning-path">
            <div className="learning-row unit-action-row"><span className="path-node"><FiBookOpen /></span><div><span className="learning-title">Revision notes</span><small>Open the chapter notes inside this subject workspace.</small></div>{note ? <Link className="row-start secondary" to={`/notes/${subject.id}/${note.topic}`}>{record?.notesRead || guestNotesRead ? 'Review notes' : 'Read notes'}</Link> : <button className="row-start secondary" disabled>Unavailable</button>}</div>
            <div className="learning-row unit-action-row"><span className="path-node"><FiLayers /></span><div><span className="learning-title">Flashcards</span><small>Recall the key terms and ideas from this chapter.</small></div>{flashcardDeck ? <Link className="row-start secondary" to={`/flashcards/${flashcardDeck.subject}/${flashcardDeck.deckId}`}>Open cards</Link> : <button className="row-start secondary" disabled>Coming soon</button>}</div>
            <div className="learning-row unit-action-row"><span className="path-node"><FiTarget /></span><div><span className="learning-title">Quiz</span><small>{record?.notesRead || guestNotesRead ? `Answer ${user ? 10 : 5} questions and see feedback.` : 'Complete the notes to unlock the quiz.'}</small></div><button className="row-start" disabled={!(record?.notesRead || guestNotesRead) || saving} onClick={startQuiz}>Start quiz</button></div>
          </div>
        </section>}
        {quiz && result === null && <form className="unit-panel unit-quiz" onSubmit={submit}><h2>Unit quiz</h2><p>Choose an answer for every question, then submit.</p>{quiz.map((item, i) => <fieldset key={item.id} disabled={saving}><legend>{i + 1}. {item.prompt}</legend>{item.options.map(option => <label key={option}><input required type="radio" name={item.id} value={option} checked={answers[item.id] === option} onChange={() => setAnswers({ ...answers, [item.id]: option })} />{option}</label>)}</fieldset>)}<button disabled={saving || !quiz.length || Object.keys(answers).length !== quiz.length}>{saving ? 'Saving result…' : 'Submit quiz'}</button></form>}
        {result !== null && <section className="unit-panel unit-result-panel"><Confetti active={result >= PASS_SCORE} /><div className={`unit-result-badge ${result >= PASS_SCORE ? 'passed' : 'retry'}`}><FiCheck /><span>{result}%</span></div><h2>{result >= PASS_SCORE ? 'Unit passed' : 'Keep practising'}</h2><p>{resultSaved ? result >= PASS_SCORE ? index === subject.topics.length - 1 ? 'You have completed every unit in this course.' : 'The next unit is unlocked.' : 'Review the notes and try again. Your best score is retained.' : user ? 'Saving this result to your new account…' : 'Your feedback is ready. Create an account if you want to save this result and return to it later.'}</p><div className="unit-result-actions"><Link to={`/notes/${subject.id}/${note?.topic || topic.id}`}>Review notes</Link><button onClick={startQuiz}>Retry quiz</button>{!user && <button onClick={() => openLogin('register')}>Create account to save progress</button>}{result >= PASS_SCORE && subject.topics[index + 1] && <Link to={`/learn/${subject.id}/${subject.topics[index + 1].id}`}>Continue to next unit →</Link>}</div><h3>Answer review</h3><div className="unit-answer-list">{quiz.map((item, answerIndex) => { const correct = answers[item.id] === item.answer; return <article className={`unit-answer-review ${correct ? 'correct' : 'incorrect'}`} key={item.id}><div className="unit-answer-heading"><span className="unit-answer-number">{answerIndex + 1}</span><strong>{item.prompt}</strong><span className="unit-answer-status">{correct ? <><FiCheck /> Correct</> : <><span aria-hidden="true">×</span> Incorrect</>}</span></div>{!correct && <p className="unit-answer-line"><span>Your answer</span>{answers[item.id] || 'No answer'}</p>}<p className="unit-answer-line"><span>Correct answer</span>{item.answer}</p>{item.explanation && <p className="unit-answer-explanation">{item.explanation}</p>}</article>; })}</div></section>}
      </>}
      <p className="unit-privacy">{user ? 'Practice scores are saved for self-study and are not verified grades. Assigned homework is submitted separately.' : 'Guest reading and practice are not saved. Create an account only when you want progress to persist.'}</p>
      </section>
    </div>
  </main>;
}
