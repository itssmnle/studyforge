import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen, FiCheck, FiClock, FiEdit2, FiLock, FiPlus, FiSettings, FiUser, FiUsers, FiX } from "react-icons/fi";
import { scienceSubjects } from "../data/scienceCurriculum";
import { mathsSubject } from "../data/subjectConfig";
import { subjectIcons } from "../data/subjectVisuals";
import { mathLessonsForYear } from "../utils/mathLessonLibrary";
import { isTopicComplete, useCompletedNotes } from "../utils/noteProgress";
import { getHomeworkSubmissions } from "../utils/progressStorage";
import { masteryKey, useCourseMastery } from '../utils/courseMastery';
import { usePublishedNotes } from "../utils/teacherNotes";
import { getAssignments } from "../utils/assignmentStorage";
import { classesForStudent } from "../utils/classStorage";
import { useAuthModal } from "../context/AuthModalContext";
import { formatAssignmentDue } from "../utils/assignmentDates";
import StudentNotes from "./StudentNotes";
import "../styles/Platform.css";
import LoadingState from "../components/LoadingState";
import '../styles/StudyWorkspace.css';
import '../styles/MyCourses.css';

const mathsCourse = {
  ...mathsSubject,
  topics: ["year-7", "year-8", "year-9"].map((year) => {
    const lessons = mathLessonsForYear(year);
    return {
      id: year,
      name: `Year ${year.slice(-1)} Maths`,
      noteCount: lessons.reduce((total, lesson) => total + lesson.sections.length, 0),
      notesTo: `/notes/maths?year=${year}`,
      quizTo: `/examquestions?subject=maths&year=${year}`,
      groupIds: lessons.map((lesson) => lesson.id),
    };
  }),
};

const dashboardCourses = [mathsCourse, ...scienceSubjects];
const normaliseTopicName = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const noteForScienceTopic = (subject, topic, notes) => notes.find((note) =>
  note.subject === subject.id && (
    note.topic === topic.id ||
    note.topic === topic.noteTopic ||
    normaliseTopicName(note.title) === normaliseTopicName(topic.name)
  )
);

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, openLogin, updateCourseSelection, dataLoading, dataError, retryData } = useAuthModal();
  const mastery = useCourseMastery(user?.uid);
  const completedNotes = useCompletedNotes();
  const { notes: publishedNotes } = usePublishedNotes();
  const defaultSubjectIds = dashboardCourses.map((subject) => subject.id);
  const selectedSubjectIds = user?.selectedSubjectIds?.length ? user.selectedSubjectIds : defaultSubjectIds;
  const [courseEditorOpen, setCourseEditorOpen] = useState(false);
  const [courseEditMode, setCourseEditMode] = useState(false);
  const [draftSubjectIds, setDraftSubjectIds] = useState(selectedSubjectIds);
  const [savingCourses, setSavingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [removingCourseId, setRemovingCourseId] = useState("");
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [quickPanel, setQuickPanel] = useState(null);
  const [homeworkTab, setHomeworkTab] = useState('Forthcoming');
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const submissions = getHomeworkSubmissions();
  const studentClasses = classesForStudent(user?.username);
  const classIds = new Set(studentClasses.map((schoolClass) => schoolClass.id));
  const assignments = getAssignments().filter((assignment) => classIds.has(assignment.classId));
  const homeworkStatus = assignment => submissions.some(entry => entry.assignmentId === assignment.id) ? 'Completed' : assignment.dueAt && new Date(assignment.dueAt).getTime() < now ? 'Past due' : 'Forthcoming';
  const visibleHomework = assignments.filter(assignment => homeworkStatus(assignment) === homeworkTab).sort((a, b) => new Date(a.dueAt || '9999-01-01') - new Date(b.dueAt || '9999-01-01'));
  const activeHomeworkCount = assignments.filter(assignment => homeworkStatus(assignment) !== 'Completed').length;
  const displayName = user?.displayName || "Student";
  const visibleSubjects = dashboardCourses.filter((subject) => selectedSubjectIds.includes(subject.id));
  const formattedProfession = user?.profession?.replace(/^Year\s*/i, "Year ") || "Not provided";

  useEffect(() => {
    if (!pendingAssignment && !quickPanel) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setPendingAssignment(null);
        setQuickPanel(null);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [pendingAssignment, quickPanel]);

  const assignmentPath = (assignment) => `/practice/${assignment.subject}/${assignment.topic}?assignment=${assignment.id}`;

  const openAssignment = (assignment) => {
    setQuickPanel(null);
    setPendingAssignment(assignment);
  };

  const beginAssignment = () => {
    if (!pendingAssignment) return;
    navigate(assignmentPath(pendingAssignment), { state: { returnTo: '/launchpad' } });
    setPendingAssignment(null);
  };

  const openCourseEditor = () => {
    setDraftSubjectIds(selectedSubjectIds);
    setCourseError("");
    setCourseEditorOpen(true);
  };

  const toggleSubject = (subjectId) => {
    setDraftSubjectIds((current) => current.includes(subjectId)
      ? current.filter((id) => id !== subjectId)
      : [...current, subjectId]);
  };

  const saveCourses = async () => {
    if (!draftSubjectIds.length) {
      setCourseError("Select at least one course.");
      return;
    }
    setSavingCourses(true);
    setCourseError("");
    try {
      await updateCourseSelection(draftSubjectIds);
      setCourseEditorOpen(false);
    } catch (error) {
      setCourseError(error.message);
    } finally {
      setSavingCourses(false);
    }
  };

  const removeCourse = async (subjectId) => {
    if (selectedSubjectIds.length <= 1) {
      setCourseError("Keep at least one course on your dashboard.");
      return;
    }
    if (!user) {
      openLogin("login");
      return;
    }
    setRemovingCourseId(subjectId);
    setCourseError("");
    try {
      await updateCourseSelection(selectedSubjectIds.filter((id) => id !== subjectId));
    } catch (error) {
      setCourseError(error.message);
    } finally {
      setRemovingCourseId("");
    }
  };

  const revisionProgress = (subject) => {
    const topics = subject.id === "maths"
      ? subject.topics.flatMap((year) => mathLessonsForYear(year.id).map((lesson) => ({ note: lesson, topicId: lesson.id })))
      : subject.topics.map((topic) => ({ note: noteForScienceTopic(subject, topic, publishedNotes), topicId: topic.id }));
    const completed = topics.filter(({ note, topicId }) => note
      ? isTopicComplete(subject.id, note.topic, note.sections, completedNotes)
      : mastery.records[masteryKey(subject.id, topicId)]?.notesRead
    ).length;
    return { completed, total: topics.length, percentage: topics.length ? Math.round((completed / topics.length) * 100) : 0 };
  };

  return (
    <main className="academy-dashboard">{dataLoading && <LoadingState label="Updating your homework" detail="Refreshing your assignments and progress" />}{dataError && <p role="alert">{dataError} <button onClick={retryData}>Retry</button></p>}
      <section className="profile-band">
        <div className="profile-band-inner">
          <div className="profile-avatar">{displayName.slice(0, 1).toUpperCase()}</div>
          <div className="profile-copy"><h1>{displayName}</h1><p>@{user?.username || "guest"} · kojonote learner</p></div>
          {!user && <button className="outline-action" onClick={() => openLogin("register")}>Create account</button>}
          {user && <span className="account-status"><FiSettings /> Synced account</span>}
        </div>
      </section>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <span>My learning</span>
          <button className={!notesOpen ? "active" : ""} type="button" onClick={() => setNotesOpen(false)}><FiBookOpen /> Courses</button>
          <button className={notesOpen ? "active" : ""} type="button" onClick={() => setNotesOpen(true)}><FiEdit2 /> My notes</button>
          <button type="button" onClick={() => setQuickPanel("homework")}><FiClock /> Homework</button>
          <span>My account</span>
          {user ? <button type="button" onClick={() => setQuickPanel("profile")}><FiUser /> My profile</button> : <button onClick={() => openLogin("login")}><FiUser /> Log in</button>}
          <div className="sidebar-privacy"><FiLock /><p><strong>Revision is private</strong>Your teacher sees assigned homework only.</p></div>
        </aside>

        <div className={`course-workspace ${notesOpen ? "course-workspace-notes" : ""}`}>
          {notesOpen ? <StudentNotes embedded onFullscreen={() => navigate("/my-notes")} /> : <>
          <section className="homework-panel" id="homework">
            <div className="course-section-heading"><div><span>Teacher assigned</span><h3>Homework</h3></div><small>{activeHomeworkCount} active</small></div>
            <div className="work-tabs" role="tablist" aria-label="Homework status">{['Forthcoming', 'Past due', 'Completed'].map(tab => <button key={tab} role="tab" aria-selected={homeworkTab === tab} onClick={() => setHomeworkTab(tab)}>{tab} <small>{assignments.filter(item => homeworkStatus(item) === tab).length}</small></button>)}</div>
            {!visibleHomework.length && <p className="empty-homework">No {homeworkTab.toLowerCase()} homework.</p>}
            {visibleHomework.map((assignment) => {
              const submission = submissions.find((entry) => entry.assignmentId === assignment.id);
              return (
                <div className="learning-row homework-row" key={assignment.id}>
                  <span className="path-node homework"><FiClock /></span>
                  <div><span className="homework-class-label">{studentClasses.find(item => item.id === assignment.classId)?.name || assignment.className} · {scienceSubjects.find(item => item.id === assignment.subject)?.name || assignment.subject}</span><button className="homework-title" onClick={() => setPendingAssignment(assignment)}>{assignment.title}</button>{assignment.studyPackTitle && <small>Study pack: {assignment.studyPackTitle}</small>}{assignment.instructions && <p className="homework-instructions">{assignment.instructions}</p>}<small>Due {formatAssignmentDue(assignment)}</small></div>
                  {submission ? <span className="complete-label"><FiCheck /> {Number.isFinite(submission.score) ? `${submission.selfAssessedScore ?? submission.score}% submitted${submission.selfMarkedCount ? ' · self-assessed' : ''}` : 'Submitted · awaiting marking'}</span> : <button className="row-start" type="button" onClick={() => setPendingAssignment(assignment)}>{assignment.status === "in-progress" ? "Continue" : "Start"}</button>}
                </div>
              );
            })}
          </section>

          <header className="workspace-heading my-courses-heading"><div><span className="workspace-kicker">Your kojonote</span><h2>My courses</h2></div><div className="workspace-actions"><button className={`course-edit-toggle${courseEditMode ? " active" : ""}`} type="button" onClick={() => { setCourseEditMode((current) => !current); setCourseError(""); }} aria-label={courseEditMode ? "Finish editing courses" : "Edit courses"}>{courseEditMode ? <FiX /> : <FiEdit2 />}</button><button className="blue-action" type="button" onClick={openCourseEditor}><FiPlus /> Add course</button></div></header>

          {courseError ? <p className="my-courses-error" role="alert">{courseError}</p> : null}
          <section className="my-courses-list" id="progress">
            {visibleSubjects.map((subject) => {
              const progress = revisionProgress(subject);
              const SubjectIcon = subjectIcons[subject.id] || FiBookOpen;
              return (
                <article className={`my-course-card${courseEditMode ? " editing" : ""}`} key={subject.id} style={{ "--subject-color": subject.color }}>
                  {courseEditMode ? <button className="course-remove-button" type="button" disabled={removingCourseId === subject.id} onClick={() => removeCourse(subject.id)} aria-label={`Remove ${subject.name}`}>{removingCourseId === subject.id ? <FiClock /> : <FiX />}</button> : null}
                  <Link className="my-course-summary" to={`/subjects/${subject.id}`}>
                    <span className="my-course-icon"><SubjectIcon /></span>
                    <span className="my-course-copy"><small>{subject.qualification}{subject.id === "maths" ? "" : " Science"}</small><strong>{subject.name}</strong><span>{subject.id === "maths" ? "Years 7 to 9" : `${subject.topics.length} chapters`}</span></span>
                    <span className="my-course-open">Open course</span>
                  </Link>
                  <Link className="course-revision-progress" to={subject.id === "maths" ? "/notes/maths" : `/notes/${subject.id}`} aria-label={`${subject.name} revision notes, ${progress.percentage}% complete`}>
                    <span className="course-progress-label"><span><FiBookOpen /> Revision Notes</span><strong>{progress.percentage}%</strong></span>
                    <span className="course-progress-track"><span style={{ width: `${progress.percentage}%` }} /></span>
                    <small>{progress.completed} of {progress.total} topics completed</small>
                  </Link>
                </article>
              );
            })}
          </section>

          <section className="student-profile-section" id="profile">
            <div className="course-section-heading"><div><span>My account</span><h3>My profile</h3></div><Link to="/settings">Account settings</Link></div>
            <div className="student-profile-grid">
              <dl>
                <div><dt>Full name</dt><dd>{user.fullName}</dd></div>
                <div><dt>Username</dt><dd>@{user.username}</dd></div>
                <div><dt>Year group</dt><dd>{formattedProfession}</dd></div>
                <div><dt>Account type</dt><dd>Student</dd></div>
              </dl>
              <div className="profile-class-list"><h4><FiUsers /> Classes</h4>{studentClasses.length ? <ul>{studentClasses.map((schoolClass) => <li key={schoolClass.id}><span className="profile-class-dot" style={{ background: schoolClass.color || "#7c3aed" }} />{schoolClass.name}</li>)}</ul> : <p>You have not been added to a class yet.</p>}</div>
            </div>
          </section>
        </>}
        </div>
      </div>

      {courseEditorOpen && <div className="course-editor-backdrop" onMouseDown={() => setCourseEditorOpen(false)}>
        <section className="course-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="course-editor-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className="eyebrow">Course preferences</span><h2 id="course-editor-title">Add courses</h2></div><button type="button" onClick={() => setCourseEditorOpen(false)} aria-label="Close course editor"><FiX /></button></header>
          <p>Select any additional subjects you want shown on your dashboard.</p>
          <div className="course-choice-list">{dashboardCourses.filter((subject) => !selectedSubjectIds.includes(subject.id)).map((subject) => <label key={subject.id} style={{ "--subject-color": subject.color }}><input type="checkbox" checked={draftSubjectIds.includes(subject.id)} onChange={() => toggleSubject(subject.id)} /><span className="course-choice-dot" /><span><strong>{subject.name}</strong><small>{subject.id === "maths" ? `${subject.qualification} · Years 7 to 9` : `${subject.qualification} Science · ${subject.topics.length} topics`}</small></span><FiCheck /></label>)}</div>
          {dashboardCourses.every((subject) => selectedSubjectIds.includes(subject.id)) ? <p>All available courses are already on your dashboard.</p> : null}
          {courseError && <p className="course-editor-error">{courseError}</p>}
          <footer><button className="platform-button secondary" type="button" onClick={() => setCourseEditorOpen(false)}>Cancel</button><button className="platform-button primary" type="button" onClick={saveCourses} disabled={savingCourses || dashboardCourses.every((subject) => selectedSubjectIds.includes(subject.id))}>{savingCourses ? "Saving..." : "Add courses"}</button></footer>
        </section>
      </div>}

      {quickPanel && <div className="student-quick-panel-backdrop" onMouseDown={() => setQuickPanel(null)}>
        <section className="student-quick-panel" role="dialog" aria-modal="true" aria-labelledby="student-quick-panel-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className="eyebrow">{quickPanel === "homework" ? "My learning" : "My account"}</span><h2 id="student-quick-panel-title">{quickPanel === "homework" ? "Homework" : "My profile"}</h2></div><button type="button" onClick={() => setQuickPanel(null)} aria-label={`Close ${quickPanel} panel`}><FiX /></button></header>
          <div className="student-quick-panel-content">
            {quickPanel === "homework" ? <>
              <div className="work-tabs" role="tablist" aria-label="Homework status">{['Forthcoming', 'Past due', 'Completed'].map(tab => <button key={tab} role="tab" aria-selected={homeworkTab === tab} onClick={() => setHomeworkTab(tab)}>{tab} <small>{assignments.filter(item => homeworkStatus(item) === tab).length}</small></button>)}</div>
              {!visibleHomework.length && <p className="empty-homework">No {homeworkTab.toLowerCase()} homework.</p>}
              {visibleHomework.map((assignment) => {
                const submission = submissions.find((entry) => entry.assignmentId === assignment.id);
                return <div className="learning-row homework-row" key={assignment.id}><span className="path-node homework"><FiClock /></span><div><span className="homework-class-label">{studentClasses.find(item => item.id === assignment.classId)?.name || assignment.className} · {scienceSubjects.find(item => item.id === assignment.subject)?.name || assignment.subject}</span><button className="homework-title" onClick={() => openAssignment(assignment)}>{assignment.title}</button>{assignment.studyPackTitle && <small>Study pack: {assignment.studyPackTitle}</small>}{assignment.instructions && <p className="homework-instructions">{assignment.instructions}</p>}<small>Due {formatAssignmentDue(assignment)}</small></div>{submission ? <span className="complete-label"><FiCheck /> {Number.isFinite(submission.score) ? `${submission.selfAssessedScore ?? submission.score}% submitted${submission.selfMarkedCount ? ' · self-assessed' : ''}` : 'Submitted · awaiting marking'}</span> : <button className="row-start" type="button" onClick={() => openAssignment(assignment)}>{assignment.status === "in-progress" ? "Continue" : "Start"}</button>}</div>;
              })}
            </> : <div className="student-profile-grid">
              <dl><div><dt>Full name</dt><dd>{user.fullName}</dd></div><div><dt>Username</dt><dd>@{user.username}</dd></div><div><dt>Year group</dt><dd>{formattedProfession}</dd></div><div><dt>Account type</dt><dd>Student</dd></div></dl>
              <div className="profile-class-list"><h4><FiUsers /> Classes</h4>{studentClasses.length ? <ul>{studentClasses.map((schoolClass) => <li key={schoolClass.id}><span className="profile-class-dot" style={{ background: schoolClass.color || "#7c3aed" }} />{schoolClass.name}</li>)}</ul> : <p>You have not been added to a class yet.</p>}</div>
            </div>}
          </div>
          {quickPanel === "profile" && <footer><Link className="platform-button primary" to="/settings" onClick={() => setQuickPanel(null)}>Account settings</Link></footer>}
        </section>
      </div>}

      {pendingAssignment && <div className="study-check-backdrop" onMouseDown={() => setPendingAssignment(null)}>
        <section className="study-check-dialog" role="alertdialog" aria-modal="true" aria-labelledby="study-check-title" aria-describedby="study-check-description" onMouseDown={(event) => event.stopPropagation()}>
          <span className="study-check-icon"><FiBookOpen /></span>
          <span className="eyebrow">Before you begin</span>
          <h2 id="study-check-title">Did you study beforehand?</h2>
          <p id="study-check-description">You are about to start <strong>{pendingAssignment.title}</strong>. Your answers will be submitted to your teacher when you finish.</p>
          <footer>
            <button className="platform-button secondary" type="button" onClick={() => setPendingAssignment(null)}>Cancel</button>
            <button className="platform-button primary" type="button" onClick={beginAssignment} autoFocus>Proceed to quiz</button>
          </footer>
        </section>
      </div>}
    </main>
  );
}
