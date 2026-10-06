import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiClipboard, FiEdit2, FiTrash2, FiPlus, FiShield, FiUsers } from "react-icons/fi";
import { scienceSubjects } from "../data/scienceCurriculum";
import { getAllHomeworkSubmissions } from "../utils/progressStorage";
import { assignmentsForTeacher, claimOwnerlessAssignments, saveAssignment, deleteAssignment } from "../utils/assignmentStorage";
import { claimOwnerlessClasses } from "../utils/classStorage";
import { useAuthModal } from "../context/AuthModalContext";
import ClassManager from "../components/ClassManager";
import { formatAssignmentDue } from "../utils/assignmentDates";
import { correctPercentage } from "../utils/resultMetrics";
import { cardsToQuestions, listStudyPacks } from '../utils/studyResources';
import { loadFlashcardQuestionsForTopic } from '../utils/flashcardDeckRouting';
import '../styles/StudyWorkspace.css';
import "../styles/Platform.css";
import LoadingState from "../components/LoadingState";

const emptyAssignment = { classId: "", subject: "biology", topic: "cell-biology", title: "", instructions: "", dueAt: "" };

export default function Teachers() {
  const { user, openLogin, dataLoading, dataError, retryData } = useAuthModal();
  const initialOwner = user?.role === "teacher" ? user.username : "";
  const [classes, setClasses] = useState(() => claimOwnerlessClasses(user?.role === "teacher" ? user.username : ""));
  const [assignments, setAssignments] = useState(() => claimOwnerlessAssignments(user?.role === "teacher" ? user.username : "", classes));
  const [workspaceOwner, setWorkspaceOwner] = useState(initialOwner);
  const [creating, setCreating] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [form, setForm] = useState(emptyAssignment);
  const [notice, setNotice] = useState("");
  const [packs, setPacks] = useState([]);
  const [packId, setPackId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    if (user?.role !== 'teacher') return;
    const refresh = () => { const next = claimOwnerlessClasses(user.username); setClasses(next); setAssignments(assignmentsForTeacher(user.username, next)); };
    window.addEventListener('studyforge:classes-changed', refresh);
    window.addEventListener('studyforge:assignments-changed', refresh);
    refresh();
    return () => { window.removeEventListener('studyforge:classes-changed', refresh); window.removeEventListener('studyforge:assignments-changed', refresh); };
  }, [user?.role, user?.username]);
  useEffect(() => {
    let active = true;
    if (user?.role === 'teacher') listStudyPacks(user).then(value => { if (active) setPacks(value); }).catch(error => { if (active) setNotice(error.message); });
    return () => { active = false; };
  }, [user]);
  useEffect(() => {
    if (creating && !packId) void loadFlashcardQuestionsForTopic(form.subject, form.topic).catch(() => {});
  }, [creating, packId, form.subject, form.topic]);
  const submissions = getAllHomeworkSubmissions();
  const selectedSubject = scienceSubjects.find((subject) => subject.id === form.subject);
  const selectedClass = classes.find((schoolClass) => schoolClass.id === form.classId) || classes[0];
  const studentCount = new Set(classes.flatMap((schoolClass) => schoolClass.studentUsernames)).size;
  const rosterFor = (assignment) => assignment.assignedStudentUsernames || classes.find((schoolClass) => schoolClass.id === assignment.classId || schoolClass.name === assignment.className)?.studentUsernames || [];
  const assignedHomeworkCount = assignments.reduce((total, assignment) => total + rosterFor(assignment).length, 0);
  const completedSubmissionCount = assignments.reduce((total, assignment) => total + submissions.filter((submission) => submission.assignmentId === assignment.id && rosterFor(assignment).includes(submission.username)).length, 0);
  const completionRate = assignedHomeworkCount ? Math.round((completedSubmissionCount / assignedHomeworkCount) * 100) : 0;

  if (user?.role === "teacher" && user.username !== workspaceOwner) {
    const nextClasses = claimOwnerlessClasses(user.username);
    setClasses(nextClasses);
    setAssignments(claimOwnerlessAssignments(user.username, nextClasses));
    setWorkspaceOwner(user.username);
    setCreating(false);
    setEditingAssignmentId(null);
    return <main className="platform-shell access-page"><LoadingState label="Loading your teacher workspace" detail="Syncing classes, homework, and study resources" /></main>;
  }

  if (!user) {
    return <main className="platform-shell access-page"><FiShield className="access-icon" /><span className="eyebrow">Teacher access</span><h1>Teacher workspace</h1><p>Homework management and account records require a teacher account.</p><button className="platform-button primary" onClick={() => openLogin(user ? "register" : "login")}>{user ? "Create a teacher account" : "Teacher login"}</button></main>;
  }
  if (user.role !== "teacher") return <Navigate to="/launchpad" replace />;

  const updateForm = (field, value) => {
    if (field === "subject") {
      const subject = scienceSubjects.find((item) => item.id === value);
      setForm((current) => ({ ...current, subject: value, topic: subject.topics[0].id }));
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    if (!selectedClass?.studentUsernames.length) return;
    const existingAssignment = assignments.find((assignment) => assignment.id === editingAssignmentId);
    if (existingAssignment && existingAssignment.createdByUsername !== user.username) return;
    setSaving(true);
    try {
    const pack = packs.find(item => item.id === packId);
    const snapshotQuestions = pack ? cardsToQuestions(pack.cards, pack.id) : (existingAssignment?.questionSnapshot && existingAssignment.subject === form.subject && existingAssignment.topic === form.topic && !packId ? existingAssignment.questionSnapshot : await loadFlashcardQuestionsForTopic(form.subject, form.topic));
    await saveAssignment({
      id: editingAssignmentId || `assignment-${user.username}-${Date.now()}`,
      ...form,
      questionSnapshot: snapshotQuestions,
      studyPackTitle: pack?.title || (existingAssignment?.subject === form.subject && existingAssignment?.topic === form.topic ? existingAssignment?.studyPackTitle || '' : ''),
      subject: pack?.subject || form.subject,
      topic: pack ? scienceSubjects.find(item => item.id === pack.subject).topics[0].id : form.topic,
      createdByUsername: existingAssignment?.createdByUsername || user.username,
      createdByUid: existingAssignment?.createdByUid || user.uid,
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      className: selectedClass.name,
      assignedStudentUsernames: [...selectedClass.studentUsernames],
      status: existingAssignment?.status || "not-started",
      questionSource: "flashcards",
      recipients: selectedClass.studentUsernames.length,
      completed: existingAssignment?.completed || 0,
      averageScore: existingAssignment?.averageScore || 0,
    });
    setAssignments(assignmentsForTeacher(user.username, classes));
    setNotice(`${editingAssignmentId ? "Updated" : "Assigned"} “${form.title.trim()}” ${editingAssignmentId ? "for" : "to"} ${selectedClass.name}.`);
    setForm({ ...emptyAssignment, classId: classes[0]?.id || "" });
    setCreating(false);
    setEditingAssignmentId(null);
    setPackId('');
    } catch (error) { setNotice(error.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingId) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteAssignment(deleteTarget.id);
      if (editingAssignmentId === deleteTarget.id) { setCreating(false); setEditingAssignmentId(null); }
      setNotice(`Deleted “${deleteTarget.title}”.`); setDeleteTarget(null);
    } catch (error) { setNotice(error.message); }
    finally { setDeletingId(null); }
  };

  const startEditing = (assignment) => {
    setPackId('');
    const matchingClass = classes.find((schoolClass) => schoolClass.id === assignment.classId || schoolClass.name === assignment.className);
    setForm({
      classId: matchingClass?.id || classes[0]?.id || "",
      subject: assignment.subject,
      topic: assignment.topic,
      title: assignment.title,
      instructions: assignment.instructions || "",
      dueAt: assignment.dueAt || "",
    });
    setEditingAssignmentId(assignment.id);
    setCreating(true);
    setNotice("");
    window.scrollTo({ top: 210, behavior: "smooth" });
  };

  return (
    <main className="platform-shell teacher-page">
      <header className="teacher-header">
        <div>
          <span className="eyebrow">Teacher workspace</span>
          <h1>Welcome, {user.fullName || user.displayName || user.username}</h1>
          <p>Assign curriculum-linked practice and review submitted homework.</p>
        </div>
        <div className="teacher-header-actions"><Link className="platform-button secondary" to="/teachers/accounts"><FiUsers /> Accounts</Link><button className="platform-button primary" onClick={() => { setForm({ ...emptyAssignment, classId: classes[0]?.id || "" }); setEditingAssignmentId(null); setCreating(true); setNotice(""); }}><FiPlus /> Create homework</button></div>
      </header>

      <aside className="privacy-banner teacher-privacy">
        <FiCheckCircle />
        <div><strong>Clear visibility boundary</strong><p>You can see assigned homework results. Students' independent revision is never shown here.</p></div>
      </aside>

      {dataLoading && <LoadingState label="Updating homework" detail="Refreshing assignments and class progress" />}
      {dataError && <p role="alert">{dataError} <button onClick={retryData}>Retry</button></p>}
      {deleteTarget && <div className="homework-delete-backdrop"><section className="homework-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-hw-title"><h2 id="delete-hw-title">Delete homework?</h2><p>“{deleteTarget.title}” will be removed from your students’ homework. Existing submission records will be retained.</p><div className="form-actions"><button className="platform-button secondary" disabled={Boolean(deletingId)} onClick={() => setDeleteTarget(null)}>Cancel</button><button className="platform-button primary" disabled={Boolean(deletingId)} onClick={confirmDelete}>{deletingId ? 'Deleting…' : 'Delete homework'}</button></div></section></div>}
      {notice && <div className="assignment-success"><FiCheckCircle /> {notice}</div>}

      {creating && (
        <form className="assignment-form" onSubmit={submitAssignment}>
          <div className="section-heading"><div><span className="eyebrow">{editingAssignmentId ? "Edit assignment" : "New assignment"}</span><h2>{editingAssignmentId ? "Update homework" : "Set homework"}</h2></div></div>
          <div className="form-grid">
            <label>Class<select value={form.classId} onChange={(event) => updateForm("classId", event.target.value)}>{classes.map((schoolClass) => <option value={schoolClass.id} key={schoolClass.id}>{schoolClass.name} ({schoolClass.studentUsernames.length})</option>)}</select></label>
            <label>Subject<select value={form.subject} onChange={(event) => updateForm("subject", event.target.value)}>{scienceSubjects.map((subject) => <option value={subject.id} key={subject.id}>{subject.name}</option>)}</select></label>
            <label>Topic<select value={form.topic} onChange={(event) => updateForm("topic", event.target.value)}>{selectedSubject.topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.name}</option>)}</select></label>
            <label>Due date and time<input type="datetime-local" value={form.dueAt} onChange={(event) => updateForm("dueAt", event.target.value)} required /></label>
          </div>
          <div className="assignment-details">
            <label>Question source<select value={packId} disabled={saving} onChange={event => { setPackId(event.target.value); const pack = packs.find(item => item.id === event.target.value); if (pack) setForm(current => ({ ...current, subject: pack.subject, topic: scienceSubjects.find(item => item.id === pack.subject).topics[0].id })); }}><option value="">{editingAssignmentId ? 'Keep assignment questions (or update topic)' : 'Topic flashcards'}</option>{packs.map(pack => <option key={pack.id} value={pack.id}>Study pack: {pack.title}</option>)}</select></label>
            <label>Assignment title<input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="For example: Cell biology checkpoint" required /></label>
            <label>Instructions <span className="optional-label">Optional</span><textarea value={form.instructions} onChange={(event) => updateForm("instructions", event.target.value)} placeholder="Tell students what to complete and anything they should prepare." /></label>
          </div>
          {!selectedClass?.studentUsernames.length && <p className="assignment-warning">Add at least one student to {selectedClass?.name || "this class"} before assigning homework.</p>}
          <div className="form-actions"><button type="button" className="platform-button secondary" disabled={saving} onClick={() => { setCreating(false); setEditingAssignmentId(null); }}>Cancel</button><button className="platform-button primary" disabled={saving || !selectedClass?.studentUsernames.length}>{saving ? 'Saving…' : editingAssignmentId ? "Save changes" : `Assign to ${selectedClass?.studentUsernames.length || 0} students`} <FiArrowRight /></button></div>
        </form>
      )}

      <section className="teacher-stats" aria-label="Class summary">
        <article><FiUsers /><div><strong>{studentCount}</strong><span>assigned students</span></div></article>
        <article><FiClipboard /><div><strong>{assignments.length}</strong><span>active assignments</span></div></article>
        <article><FiCheckCircle /><div><strong>{completionRate}%</strong><span>submission rate</span></div></article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><span className="eyebrow">Teacher-visible work only</span><h2>Assignments</h2></div></div>
        <div className="teacher-assignment-list">
          {assignments.map((assignment) => {
            const recipientsList = rosterFor(assignment);
            const assignmentSubmissions = submissions.filter((item) => item.assignmentId === assignment.id && recipientsList.includes(item.username));
            const completed = assignmentSubmissions.length;
            const recipients = recipientsList.length;
            const gradedSubmissions = assignmentSubmissions.filter(submission => Number.isFinite(submission.score));
            const average = gradedSubmissions.length ? Math.round(gradedSubmissions.reduce((total, submission) => total + correctPercentage(submission), 0) / gradedSubmissions.length) : null;
            return (
              <article className="teacher-assignment-row" key={assignment.id}>
                <div><span className="subject-label">{assignment.className} · {assignment.subject}</span><h3><Link to={`/teachers/assignments/${assignment.id}`}>{assignment.title}</Link></h3><p>Due {formatAssignmentDue(assignment)}</p>{assignment.instructions && <p className="assignment-row-instructions">{assignment.instructions}</p>}</div>
                <div className="assignment-metric"><strong>{completed}/{recipients}</strong><span>completed</span></div>
                <div className="assignment-metric"><strong>{average === null ? "—" : `${average}%`}</strong><span>average score</span></div>
                <div className="assignment-row-actions"><Link to={`/teachers/assignments/${assignment.id}`} title="View results"><FiBarChart2 /></Link>{assignment.createdByUid === user.uid && <><button onClick={() => startEditing(assignment)} title="Edit assignment"><FiEdit2 /></button><button onClick={() => setDeleteTarget(assignment)} title="Delete homework" aria-label={`Delete ${assignment.title}`}><FiTrash2 /></button></>}<Link to={`/practice/${assignment.subject}/${assignment.topic}?assignment=${assignment.id}&preview=teacher`} title="Preview"><FiArrowRight /></Link></div>
              </article>
            );
          })}
        </div>
      </section>
      <ClassManager classes={classes} ownerUsername={user.username} onClassesChange={setClasses} />
    </main>
  );
}
