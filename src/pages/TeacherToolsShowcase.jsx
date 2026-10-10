import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheck, FiClipboard, FiEdit3, FiEye, FiLock, FiSearch, FiUsers } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/TeacherShowcase.css";

const capabilities = [
  { icon: FiUsers, title: "Manage classes", copy: "Create branded class spaces, search large student directories, and control membership without endless checkbox lists." },
  { icon: FiClipboard, title: "Set structured homework", copy: "Choose a class, subject, and topic, then add instructions and an exact due date and time." },
  { icon: FiEdit3, title: "Edit question banks", copy: "Add, revise, or remove multiple-choice, short-answer, and numerical questions for each topic." },
  { icon: FiEye, title: "Preview safely", copy: "Run through assignments as a teacher without creating student results or entering the learner portal." },
  { icon: FiBarChart2, title: "Inspect every response", copy: "See completion, correct-answer averages, question success rates, and each student’s submitted answer." },
  { icon: FiLock, title: "Keep boundaries clear", copy: "Teachers see assigned homework results. Independent student revision remains private." },
];

export default function TeacherToolsShowcase() {
  const { user, openLogin } = useAuthModal();
  const isTeacher = user?.role === "teacher";

  return (
    <main className="teacher-showcase">
      <section className="teacher-showcase-hero">
        <div className="teacher-showcase-copy">
          <span className="eyebrow">kojonote for teachers</span>
          <h1>Assign work, understand answers, and act on the gaps.</h1>
          <p>A focused teacher workspace for organising classes, building science homework, and seeing exactly where students need support.</p>
          <div className="teacher-showcase-actions">
            {isTeacher ? <Link className="platform-button primary" to="/teachers">Open teacher dashboard <FiArrowRight /></Link> : <button className="platform-button primary" onClick={() => openLogin(user ? "register" : "login")}>{user ? "Create a teacher account" : "Teacher login"} <FiArrowRight /></button>}
            <a className="platform-button secondary" href="#teacher-features">See all features</a>
          </div>
          <small><FiLock /> Secure username accounts are available while Microsoft tenant access is pending.</small>
        </div>
        <div className="teacher-showcase-preview" aria-label="Example assignment analysis">
          <header><span>Assignment analysis</span><strong>Cell biology checkpoint</strong><small>10A Science</small></header>
          <div className="showcase-stats"><div><strong>18/24</strong><span>submitted</span></div><div><strong>72%</strong><span>correct average</span></div></div>
          <div className="showcase-question"><span>Question 1</span><strong>67% correct</strong><i><b style={{ width: "67%" }} /></i></div>
          <div className="showcase-question"><span>Question 2</span><strong>83% correct</strong><i><b style={{ width: "83%" }} /></i></div>
          <div className="showcase-students"><span><i>AM</i><b>Amina Malik</b><small><FiCheck /> Correct</small></span><span><i>JT</i><b>Jamie Tran</b><small className="incorrect">Needs review</small></span></div>
        </div>
      </section>

      <section className="teacher-capability-section" id="teacher-features">
        <header><span className="eyebrow">Complete workflow</span><h2>Everything from class setup to answer analysis</h2><p>The teacher tools are connected, so class membership controls assignment delivery and submissions feed directly into question-level reporting.</p></header>
        <div className="teacher-capability-grid">{capabilities.map((capability) => { const Icon = capability.icon; return <article key={capability.title}><Icon /><h3>{capability.title}</h3><p>{capability.copy}</p></article>; })}</div>
      </section>

      <section className="teacher-workflow-showcase">
        <div><span className="eyebrow">How it works</span><h2>One traceable homework flow</h2></div>
        <ol><li><span>01</span><div><strong>Build the class</strong><p>Search students by full name or username and add them to a customised class.</p></div></li><li><span>02</span><div><strong>Publish the assignment</strong><p>Select topic questions, write instructions, and set the deadline.</p></div></li><li><span>03</span><div><strong>Review the evidence</strong><p>Open the assignment, compare question rates, and inspect individual answers.</p></div></li></ol>
      </section>

      <section className="teacher-showcase-cta"><FiSearch /><div><span className="eyebrow">Ready to explore?</span><h2>Open the workspace and build your first class.</h2></div>{isTeacher ? <Link className="platform-button primary" to="/teachers">Go to dashboard <FiArrowRight /></Link> : <button className="platform-button primary" onClick={() => openLogin(user ? "register" : "login")}>{user ? "Create teacher account" : "Log in as a teacher"}</button>}</section>
    </main>
  );
}
