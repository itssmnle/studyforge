import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiRefreshCw, FiX } from "react-icons/fi";
import { findSubject, findTopic } from "../data/scienceCurriculum";
import { questionsForTopic } from "../data/scienceQuestions";
import { saveHomeworkSubmission, savePrivatePractice } from "../utils/progressStorage";
import { getAssignments } from "../utils/assignmentStorage";
import { useAuthModal } from "../context/AuthModalContext";
import { classesForStudent, getClasses, teacherCanAccessClass } from "../utils/classStorage";
import { formatAssignmentDue } from "../utils/assignmentDates";
import { loadFlashcardQuestionsForTopic } from "../utils/flashcardDeckRouting";
import { readTestDraft } from '../utils/practiceTests';
import { exactTextMatch, isCorrectAnswer } from '../utils/answerGrading';
import { completeFlow, startFlow, updateFlow } from '../utils/analytics';
import Confetti from '../components/Confetti';
import LoadingState from '../components/LoadingState';
import "../styles/Platform.css";

export default function PracticeSession() {
  const { subject: subjectId, topic: topicId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const testId = searchParams.get('test');
  const customTest = useMemo(() => readTestDraft(testId), [testId]);
  const { user, dataLoading, openLogin } = useAuthModal();
  const subject = findSubject(subjectId);
  const topic = findTopic(subjectId, topicId);
  const curriculumQuestions = useMemo(() => questionsForTopic(subjectId, topicId), [subjectId, topicId]);
  const assignmentId = searchParams.get("assignment");
  const assignment = getAssignments().find((item) => item.id === assignmentId);
  const teacherPreview = searchParams.get("preview") === "teacher" && user?.role === "teacher";
  const studentClasses = classesForStudent(user?.username);
  const assignmentClass = assignment ? getClasses().find((schoolClass) => schoolClass.id === assignment.classId) : null;
  const canOpenAssignment = !assignment || studentClasses.some((schoolClass) => schoolClass.id === assignment.classId);
  const canPreviewAssignment = teacherPreview && (
    assignment?.createdByUsername === user?.username || teacherCanAccessClass(assignmentClass, user?.username)
  );
  const testMode = searchParams.get("mode") === "test" || Boolean(assignment);
  const questionRequestKey = `${subjectId}/${topicId}`;
  const [assignmentQuestionState, setAssignmentQuestionState] = useState({ key: "", questions: [], error: "" });
  const questionPool = assignment ? assignment.questionSnapshot || assignmentQuestionState.questions : customTest?.questions || curriculumQuestions;
  const questions = !user && !assignment && !customTest ? questionPool.slice(0, 5) : questionPool;
  const questionsLoading = Boolean(assignmentId) && !assignment?.questionSnapshot && assignmentQuestionState.key !== questionRequestKey;
  const questionsError = assignmentQuestionState.key === questionRequestKey ? assignmentQuestionState.error : "";
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewPosition, setReviewPosition] = useState(0);
  const [selfMarks, setSelfMarks] = useState({});
  const [finalResult, setFinalResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const migratedGuestResult = useRef(false);
  const flowId = `${subjectId}/${topicId}`;
  useEffect(() => {
    if (subject && topic && !assignment && !teacherPreview) startFlow('practice', flowId, 'question-1', `/practice/${flowId}`);
  }, [assignment, flowId, subject, teacherPreview, topic]);
  useEffect(() => {
    if (!assignment && !teacherPreview) updateFlow('practice', flowId, `question-${index + 1}`);
  }, [assignment, flowId, index, teacherPreview]);
  useEffect(() => {
    if (!user || !complete || assignment || teacherPreview || finalResult?.saved !== false || migratedGuestResult.current) return;
    migratedGuestResult.current = true;
    const pendingResult = { ...finalResult };
    delete pendingResult.saved;
    setSubmitting(true);
    setSubmitError('');
    savePrivatePractice(pendingResult)
      .then((saved) => setFinalResult({ ...saved, saved: true }))
      .catch((error) => {
        migratedGuestResult.current = false;
        setSubmitError(error.message || 'Your result could not be saved. Please try again.');
      })
      .finally(() => setSubmitting(false));
  }, [assignment, complete, finalResult, teacherPreview, user]);
  useEffect(() => {
    if (!customTest?.timer || complete) return undefined;
    const started = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [customTest, complete]);
  const exit = () => {
    if (location.state?.builder) navigate(location.state.returnTo, { replace: true });
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate(teacherPreview ? '/teachers' : assignment ? '/launchpad' : `/examquestions?subject=${subjectId}`, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    if (!assignmentId || getAssignments().find(item => item.id === assignmentId)?.questionSnapshot) return undefined;
    loadFlashcardQuestionsForTopic(subjectId, topicId)
      .then((loaded) => { if (!cancelled) setAssignmentQuestionState({ key: questionRequestKey, questions: loaded, error: "" }); })
      .catch((error) => { if (!cancelled) setAssignmentQuestionState({ key: questionRequestKey, questions: [], error: error.message }); });
    return () => { cancelled = true; };
  }, [assignmentId, questionRequestKey, subjectId, topicId]);

  if (!subject || !topic) return <Navigate to="/examquestions" replace />;
  if (testId && (!customTest?.questions?.length || customTest.subject !== subjectId)) return <Navigate to={`/examquestions?subject=${subjectId}`} replace />;
  if (assignmentId && !assignment && dataLoading) return <main className="practice-page"><LoadingState label="Loading your homework" detail="Finding your assigned questions" /></main>;
  if (assignmentId && !assignment) return <Navigate to={user?.role === "teacher" ? "/teachers" : "/launchpad"} replace />;
  if (user?.role === "teacher" && !teacherPreview) return <Navigate to="/teachers" replace />;
  if (assignment && teacherPreview && !canPreviewAssignment) return <Navigate to="/teachers" replace />;
  if (assignment && !teacherPreview && (!user || user.role !== "student" || !canOpenAssignment)) return <Navigate to="/launchpad" replace />;
  if (questionsLoading) return <main className="practice-page">{submitError && <p role="alert">{submitError}</p>}{submitting && <p role="status">Saving submission…</p>}<LoadingState label="Loading your questions" detail="Building a focused practice set" /></main>;
  if (questionsError) return <main className="practice-page">{submitError && <p role="alert">{submitError}</p>}{submitting && <p role="status">Saving submission…</p>}<section className="question-shell"><h1>Quiz unavailable</h1><p role="alert">{questionsError}</p><Link className="platform-button secondary" to={teacherPreview ? "/teachers" : "/launchpad"}>Go back</Link></section></main>;
  if (!questions.length) return <Navigate to={teacherPreview ? "/teachers" : `/learn/${subjectId}/${topicId}`} replace />;

  const question = questions[index];
  const answer = answers[question.id] || "";
  const correct = isCorrectAnswer(question, answer);
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const answerIsCorrect = (item) => assignment ? exactTextMatch(answers[item.id] || "", item.answer) : isCorrectAnswer(item, answers[item.id] || "");
  const scoreCount = questions.filter(answerIsCorrect).length;
  const score = Math.round((scoreCount / questions.length) * 100);

  const updateAnswer = (value) => setAnswers((current) => ({ ...current, [question.id]: value }));

  const submitResult = async (marks = null) => {
    if (submitting) return;
    const responses = questions.map((item) => {
      const responseAnswer = answers[item.id] || "";
      const responseCorrect = answerIsCorrect(item) || marks?.[item.id] === true;
      return {
        questionId: item.id,
        prompt: item.prompt,
        answer: responseAnswer,
        correctAnswer: item.answer,
        correct: responseCorrect,
        answered: Boolean(responseAnswer.trim()),
        selfMarked: marks ? !exactTextMatch(responseAnswer, item.answer) && Boolean(responseAnswer.trim()) : false,
      };
    });
    const finalCorrect = responses.filter((response) => response.correct).length;
    const result = {
      ...(assignment ? { assignmentId: assignment.id } : {}),
      ...(customTest ? { testTitle: customTest.title, testTopics: customTest.topics, testTypes: customTest.types, testDifficulties: customTest.difficulties } : {}),
      subject: subjectId,
      topic: topicId,
      topicName: topic.name,
      correct: finalCorrect,
      total: questions.length,
      score: Math.round((finalCorrect / questions.length) * 100),
      responses,
      selfMarks: marks || {},
    };
    if (teacherPreview) {
      setFinalResult(result); setComplete(true);
      return;
    }
    setSubmitting(true); setSubmitError('');
    try {
      const saved = assignment ? await saveHomeworkSubmission(result) : user ? { ...await savePrivatePractice(result), saved: true } : { ...result, saved: false };
      if (!assignment && !teacherPreview) completeFlow('practice', flowId, 'practice_completion', { subject: subjectId, topic: topicId, questions: questions.length, score: result.score });
      setFinalResult(saved); setComplete(true);
    } catch (e) { setSubmitError(e.message || 'Submission failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const finish = () => {
    if (submitting) return;
    const review = questions.filter(item => item.type === 'short-answer' && String(answers[item.id] || '').trim() && !isCorrectAnswer(item, answers[item.id]));
    if (!review.length) { submitResult(); return; }
    setReviewQueue(review); setReviewPosition(0); setSelfMarks({});
  };
  const markReviewed = correctMark => {
    const next = { ...selfMarks, [reviewQueue[reviewPosition].id]: correctMark };
    setSelfMarks(next);
    if (reviewPosition + 1 === reviewQueue.length) submitResult(next);
    else setReviewPosition(position => position + 1);
  };

  if (complete) {
    const displayedScore = finalResult?.selfAssessedScore ?? finalResult?.score ?? score;
    const displayedCorrect = finalResult?.selfAssessedCorrect ?? finalResult?.correct ?? scoreCount;
    return (
      <main className="platform-shell result-page">
        <section className="result-card">
          <Confetti active={displayedScore >= 80} />
          <span className="result-icon"><FiCheck /></span>
          <span className="eyebrow">{teacherPreview ? "Teacher preview complete" : assignment ? "Homework submitted" : finalResult?.saved ? "Private practice saved" : "Practice complete"}</span>
          <h1>{displayedScore}%</h1>
          <p>You marked {displayedCorrect} of {questions.length} answers correct.</p>
          {finalResult?.selfMarkedCount > 0 && <p>{assignment ? "Includes your self-marks and counts toward the homework average." : "Includes your self-marking."}</p>}
          {finalResult?.syncWarning && <p role="status">{finalResult.syncWarning}</p>}
          {!assignment && !teacherPreview && !finalResult?.saved && <p>{user ? "Saving this result to your new account…" : "Create an account if you want to save this result and see it again later."}</p>}
          {submitError && <p role="alert">{submitError}</p>}
          <div className="result-actions">
            <button className="platform-button secondary" onClick={() => { migratedGuestResult.current = false; startFlow('practice', flowId, 'question-1', `/practice/${flowId}`); setAnswers({}); setChecked({}); setIndex(0); setComplete(false); setFinalResult(null); setReviewQueue([]); setReviewPosition(0); setSelfMarks({}); }}><FiRefreshCw /> Try again</button>
            {!user && !assignment && !teacherPreview ? <button className="platform-button primary" onClick={() => openLogin('register')}>Create account to save <FiArrowRight /></button> : <button className="platform-button primary" disabled={submitting} onClick={() => navigate(teacherPreview ? '/teachers' : assignment ? '/launchpad' : `/examquestions?subject=${subjectId}`, { replace: true })}>{assignment || teacherPreview ? 'Back to dashboard' : 'Practice history'} <FiArrowRight /></button>}
          </div>
          <p className="result-privacy">{teacherPreview ? "Preview results are not saved as student work." : assignment ? "This submission is visible to your teacher." : finalResult?.saved ? "This result is visible only to you." : "This guest result has not been saved."}</p>
        </section>
      </main>
    );
  }


  if (reviewQueue.length) {
    const item = reviewQueue[reviewPosition];
    return <main className="practice-page">
      <header className="practice-topbar"><div><strong>Check your answers</strong><span>{reviewPosition + 1} of {reviewQueue.length}</span></div></header>
      <section className="self-mark-card"><h1>{item.prompt}</h1>
        <div className="self-mark-comparison"><div><span>Your answer</span><p>{answers[item.id]}</p></div><div><span>Model answer</span><p>{item.answer}</p></div></div>
        <p>Does your answer mean the same thing? {assignment ? 'Your self-mark counts toward your homework score and is visible to your teacher.' : user ? 'Your self-mark is saved with your private practice.' : 'Your self-mark is included in this guest result but is not saved.'}</p>
        {submitError && <p role="alert">{submitError}</p>}
        {submitting && <p role="status">Saving your answers and self-marks…</p>}
        <div className="self-mark-actions"><button disabled={submitting} className="platform-button incorrect-mark" onClick={() => markReviewed(false)}><FiX /> No, I was wrong</button><button disabled={submitting} className="platform-button correct-mark" onClick={() => markReviewed(true)}><FiCheck /> Yes, I’m correct</button></div>
      </section>
    </main>;
  }

  return (
    <main className="practice-page">{submitError && <p role="alert">{submitError}</p>}{submitting && <p role="status">Saving submission…</p>}
      <header className="practice-topbar">
        <button className="back-link" onClick={exit}><FiArrowLeft /> Exit</button>
        <div><strong>{assignment?.title || customTest?.title || topic.name}</strong><span>{teacherPreview ? "Teacher preview" : assignment ? assignment.className : "Independent practice"}</span></div>
        <span className={`session-visibility ${assignment ? "assigned" : "private"}`}><FiLock /> {teacherPreview || !user ? "Not saved" : assignment ? "Teacher visible" : "Private"}</span>
      </header>
      {customTest?.timer && <p className="test-countdown" role="timer">{elapsed >= customTest.minutes * 60 ? 'Time is up. Finish your answers when ready.' : `${Math.floor((customTest.minutes * 60 - elapsed) / 60)}:${String((customTest.minutes * 60 - elapsed) % 60).padStart(2, '0')} remaining`}</p>}

      <div className="practice-progress" aria-label={`Question ${index + 1} of ${questions.length}`}>
        <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      {assignment?.instructions && <aside className="practice-instructions"><strong>Instructions</strong><p>{assignment.instructions}</p><small>Due {formatAssignmentDue(assignment)}</small></aside>}

      <section className="question-shell">
        <div className="question-meta">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{question.difficulty} · {question.marks} {question.marks === 1 ? "mark" : "marks"}</span>
        </div>
        <h1>{question.prompt}</h1>

        {question.type === "multiple-choice" ? (
          <div className="option-list">
            {question.options.map((option, optionIndex) => (
              <label className={`answer-option ${answer === option ? "selected" : ""}`} key={option}>
                <input type="radio" name={question.id} value={option} checked={answer === option} onChange={() => updateAnswer(option)} />
                <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
              </label>
            ))}
          </div>
        ) : (
          <label className="written-answer">
            <span>Your answer {question.unit && `(in ${question.unit})`}</span>
            {question.type === 'numerical' ? <input type="number" value={answer} onChange={event => updateAnswer(event.target.value)} placeholder="Type your answer" /> : <textarea rows={4} value={answer} onChange={event => updateAnswer(event.target.value)} placeholder="Type your answer" />}
          </label>
        )}

        {!testMode && checked[question.id] && (
          <div className={`feedback-card ${correct ? "correct" : "incorrect"}`}>
            <strong>{correct ? "Correct" : `Not quite. The answer is ${question.answer}${question.unit ? ` ${question.unit}` : ""}.`}</strong>
            <p>{question.explanation}</p>
          </div>
        )}

        <footer className="question-footer">
          <button className="platform-button secondary" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><FiArrowLeft /> Previous</button>
          <span>{answeredCount}/{questions.length} answered</span>
          {index < questions.length - 1 ? (
            <button className="platform-button primary" disabled={!answer && !testMode} onClick={() => {
              if (!testMode && !checked[question.id]) setChecked((value) => ({ ...value, [question.id]: true }));
              else setIndex((value) => value + 1);
            }}>
              {!testMode && !checked[question.id] ? "Check answer" : "Next"} <FiArrowRight />
            </button>
          ) : !testMode && !checked[question.id] ? (
            <button className="platform-button primary" disabled={!answer} onClick={() => setChecked((value) => ({ ...value, [question.id]: true }))}>Check answer <FiCheck /></button>
          ) : (
            <button className="platform-button primary" disabled={submitting || (!testMode && answeredCount !== questions.length)} onClick={finish}>Finish <FiCheck /></button>
          )}
        </footer>
        <p className="provenance">{question.provenance} · {question.subtopic}</p>
      </section>
    </main>
  );
}
