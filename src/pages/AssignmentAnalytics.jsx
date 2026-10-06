import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FiCheck, FiClock, FiSearch, FiUsers, FiX } from "react-icons/fi";
import BackButton from "../components/BackButton";
import { useAuthModal } from "../context/AuthModalContext";
import { accountDatabase } from "../utils/accountDatabase";
import { formatAssignmentDue } from "../utils/assignmentDates";
import { getAssignments } from "../utils/assignmentStorage";
import { getClasses, teacherCanAccessClass } from "../utils/classStorage";
import { getAllHomeworkSubmissions } from "../utils/progressStorage";
import { correctPercentage, isResponseCorrect } from "../utils/resultMetrics";
import "../styles/Platform.css";
import LoadingState from "../components/LoadingState";

export default function AssignmentAnalytics() {
  const { assignmentId } = useParams();
  const { user, dataLoading } = useAuthModal();
  const assignment = getAssignments().find((item) => item.id === assignmentId);
  const rawSubmissions = getAllHomeworkSubmissions().filter((submission) => submission.assignmentId === assignmentId);
  const currentQuestions = assignment?.questionSnapshot || [];
  const [accounts, setAccounts] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(currentQuestions[0]?.id || "");
  const [studentQuery, setStudentQuery] = useState("");

  useEffect(() => {
    accountDatabase.list().then(setAccounts);
  }, []);

  const knownQuestions = new Map(currentQuestions.map((question) => [question.id, question]));
  rawSubmissions.forEach((submission) => submission.responses?.forEach((response) => {
    if (!knownQuestions.has(response.questionId)) knownQuestions.set(response.questionId, { id: response.questionId, prompt: response.prompt, answer: response.correctAnswer });
  }));
  const questions = [...knownQuestions.values()];

  if (!user) return <Navigate to="/teachers" replace />;
  if (user.role !== "teacher") return <Navigate to="/launchpad" replace />;
  if (!assignment && dataLoading) return <main className="platform-shell"><LoadingState label="Loading homework results" detail="Preparing the latest student submissions" /></main>;
  if (!assignment) return <main className="platform-shell access-page"><h1>Assignment not found</h1><BackButton fallback="/teachers">Back to dashboard</BackButton></main>;

  const schoolClass = getClasses().find((item) => item.id === assignment.classId);
  const canAccessAssignment = assignment.createdByUsername === user.username || teacherCanAccessClass(schoolClass, user.username);
  if (!canAccessAssignment) return <Navigate to="/teachers" replace />;
  const recipientUsernames = assignment.assignedStudentUsernames || schoolClass?.studentUsernames || [];
  const submissions = rawSubmissions.filter((submission) => recipientUsernames.includes(submission.username));
  const accountMap = new Map(accounts.map((account) => [account.username, account]));
  const submissionMap = new Map(submissions.map((submission) => [submission.username, submission]));
  const completedCount = recipientUsernames.filter((username) => submissionMap.has(username)).length;
  const gradedSubmissions = submissions.filter(submission => Number.isFinite(submission.score));
  const averageScore = gradedSubmissions.length ? Math.round(gradedSubmissions.reduce((total, submission) => total + correctPercentage(submission), 0) / gradedSubmissions.length) : null;
  const selectedQuestion = questions.find((question) => question.id === selectedQuestionId) || questions[0];
  const selectedResponses = submissions.map((submission) => ({ submission, response: submission.responses?.find((response) => response.questionId === selectedQuestion?.id) })).filter((item) => item.response);
  const correctCount = selectedResponses.filter((item) => isResponseCorrect(item.response)).length;
  const correctRate = selectedResponses.length ? Math.round((correctCount / selectedResponses.length) * 100) : 0;
  const normalisedQuery = studentQuery.trim().toLowerCase();
  const studentRows = recipientUsernames.map((username) => {
    const account = accountMap.get(username);
    const submission = submissionMap.get(username);
    const response = submission?.responses?.find((item) => item.questionId === selectedQuestion?.id);
    return { username, fullName: account?.fullName || username, submission, response };
  }).filter((row) => !normalisedQuery || `${row.fullName} ${row.username}`.toLowerCase().includes(normalisedQuery));

  return (
    <main className="platform-shell assignment-analytics-page">
      <BackButton fallback="/teachers">Teacher dashboard</BackButton>
      <header className="analytics-header"><div><span className="eyebrow">Assignment results</span><h1>{assignment.title}</h1><p>{assignment.className} · Due {formatAssignmentDue(assignment)}</p></div></header>
      <section className="analytics-summary" aria-label="Assignment summary">
        <article><FiUsers /><div><strong>{completedCount}/{recipientUsernames.length}</strong><span>submitted</span></div></article>
        <article><FiCheck /><div><strong>{averageScore === null ? 'Pending' : `${averageScore}%`}</strong><span>average score</span></div></article>
        <article><FiClock /><div><strong>{questions.length}</strong><span>questions</span></div></article>
      </section>

      <section className="question-performance-section">
        <div className="section-heading"><div><span className="eyebrow">Question analysis</span><h2>Correct rate by question</h2></div></div>
        <div className="question-metric-list">
          {questions.map((question, index) => {
            const responses = submissions.map((submission) => submission.responses?.find((response) => response.questionId === question.id)).filter(Boolean);
            const correct = responses.filter(isResponseCorrect).length;
            const rate = responses.length ? Math.round((correct / responses.length) * 100) : 0;
            return <button className={selectedQuestion?.id === question.id ? "active" : ""} onClick={() => setSelectedQuestionId(question.id)} key={question.id}><span>Question {index + 1}</span><strong>{rate}%</strong><small>{correct} correct · {responses.length - correct} incorrect</small><p>{question.prompt}</p></button>;
          })}
        </div>
      </section>

      {selectedQuestion && <section className="question-response-section">
        <header className="response-question-header"><div><span className="eyebrow">Selected question</span><h2>{selectedQuestion.prompt}</h2><p>Correct answer: <strong>{String(selectedQuestion.answer)}</strong></p></div><div className="response-rate"><strong>{correctRate}%</strong><span>{correctCount} correct</span><small>{selectedResponses.length - correctCount} incorrect</small></div></header>
        <div className="response-toolbar"><label><FiSearch /><input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} placeholder="Search student name or username" /></label><span>{studentRows.length} students</span></div>
        <div className="student-response-table">
          <div className="student-response-head"><span>Student</span><span>Answer</span><span>Result</span><span>Overall score</span></div>
          {studentRows.slice(0, 100).map((row) => <div className="student-response-row" key={row.username}><span><strong>{row.fullName}</strong><small>@{row.username}</small></span><span>{row.response?.answered ? String(row.response.answer) : row.submission ? "No answer" : "Not submitted"}</span><span className={`response-result ${isResponseCorrect(row.response) ? "answer-correct" : row.response ? "answer-incorrect" : "answer-pending"}`}><span>{isResponseCorrect(row.response) ? <><FiCheck /> Correct</> : row.response ? <><FiX /> Incorrect</> : "Pending"}</span>{row.response?.selfMarked && <small>Student self-mark: {row.response.selfMarkedCorrect ? 'correct' : 'incorrect'}</small>}</span><span>{row.submission ? Number.isFinite(row.submission.score) ? `${correctPercentage(row.submission)}%${row.submission.selfMarkedCount ? " · self-marked" : ""}` : 'Pending' : "—"}</span></div>)}
        </div>
        {studentRows.length > 100 && <p className="response-limit-note">Showing the first 100 matches. Search by name or username to narrow the list.</p>}
      </section>}
    </main>
  );
}
