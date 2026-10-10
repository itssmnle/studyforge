import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiCheck, FiLock, FiStar } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import { scienceSubjects } from "../data/scienceCurriculum";
import { mathsSubject } from "../data/subjectConfig";
import learnArt from "../assets/revision-loop/learn.svg";
import practiseArt from "../assets/revision-loop/practice.svg";
import testArt from "../assets/revision-loop/test.svg";
import yayArt from "../assets/revision-loop/yay.svg";
import { subjectIcons } from "../data/subjectVisuals";
import "../styles/Hero.css";

const biologyPreview = scienceSubjects.find((subject) => subject.id === "biology");
const homeSubjects = [
  { ...mathsSubject, to: "/subjects/maths" },
  ...scienceSubjects.map((subject) => ({ ...subject, to: `/subjects/${subject.id}` })),
];
const methodSteps = [
  { title: "Learn", subtitle: "only what matters", copy: "Use structured notes and examples that stay focused on the exact course you are studying.", benefit: "One clear route through every topic", art: learnArt },
  { title: "Practise", subtitle: "and check understanding", copy: "Apply each idea with original questions, then use the correction to close gaps immediately.", benefit: "Check understanding as you go", art: practiseArt },
  { title: "Improve", subtitle: "one correction at a time", copy: "See what is complete, what is active, and which parts of the course still need another pass.", benefit: "Return to exactly what needs work", art: testArt },
];

export default function Hero() {
  const { user } = useAuthModal();

  return (
    <main className="academy-home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-proof"><FiStar /> Focused KS3 maths and KS4 science</span>
          <h1>Revision that keeps every next step clear.</h1>
          <p>kojonote brings curriculum-linked notes, flashcards, original questions, and teacher-assigned homework into <strong className="hero-highlight">one focused revision platform</strong>.</p>
          <div className="home-actions">
            {user ? <Link className="home-primary" to={user.role === "teacher" ? "/teachers" : "/launchpad"}>{user.role === "teacher" ? "Open teacher dashboard" : "Continue learning"} <FiArrowRight /></Link> : <Link className="home-primary" to="/subjects/maths">Start learning free <FiArrowRight /></Link>}
          </div>
          <small><FiLock /> Independent revision stays private. Assigned homework is visible to teachers.</small>
          <div className="home-role-links"><Link to="/launchpad">I’m a student <span>Start revising</span></Link><Link to="/teacher-tools">I’m a teacher <span>Explore teacher tools</span></Link></div>
        </div>
        <div className="hero-learning-preview" aria-label="Example science learning path" style={{ "--preview-subject": biologyPreview?.color || "var(--primary)" }}>
          <div className="preview-heading"><span>KS4 Biology</span><strong>Cell Biology</strong></div>
          {["Cell structure", "Cell division", "Transport in cells"].map((item, index) => (
            <div className={`preview-row ${index === 0 ? "completed" : ""} ${index < 2 ? "has-connector" : ""}`} key={item}><i>{index === 0 ? <FiCheck /> : index + 1}</i><div><strong>{item}</strong><span>{index === 0 ? "Mastered" : "Ready to learn"}</span></div>{index === 1 && <b>Start</b>}</div>
          ))}
          <div className="preview-progress"><span><i /></span><small>1 of 3 skills complete</small></div>
        </div>
      </section>

      <section className="home-method">
        <header><h2>Why it works</h2></header>
        <div className="method-steps">
          {methodSteps.map(({ title, subtitle, copy, benefit, art }, index) => <article key={title}><div className="method-art" aria-hidden="true"><img src={art} alt="" /></div><div className="method-copy"><header><span>{index + 1}</span><div><h3>{title}</h3><small>{subtitle}</small></div></header><hr /><p>{copy}</p><strong className="method-benefit">{benefit}</strong></div></article>)}
        </div>
        <Link className="home-secondary home-method-link" to="/about">About kojonote <FiArrowRight /></Link>
      </section>

      <section className="home-get-started">
        <img src={yayArt} alt="" aria-hidden="true" />
        <span className="home-kicker">What are you studying?</span>
        <h2>Get started for free</h2>
        <p>Explore maths and science lessons, answer practice questions, and see feedback before you create an account.</p>
        <div className="home-actions">
          {user ? <Link className="home-primary" to={user.role === "teacher" ? "/teachers" : "/launchpad"}>Continue learning <FiArrowRight /></Link> : <><Link className="home-primary" to="/subjects/maths">Browse topics <FiArrowRight /></Link><Link className="home-secondary" to="/notes/maths">Explore maths notes</Link></>}
        </div>
      </section>

      <section className="home-subjects">
        <header><span className="home-kicker">Choose your subject</span><h2>Start with the course you are studying</h2></header>
        <div className="home-subject-grid">
          {homeSubjects.map((subject) => {
            const Icon = subjectIcons[subject.id] || FiBookOpen;
            return <Link to={subject.to} style={{ "--subject-color": subject.color, "--subject-secondary": subject.secondaryColor }} key={subject.id}><span><Icon /></span><div><small>{subject.qualification}</small><strong>{subject.name}</strong></div><FiArrowRight /></Link>;
          })}
        </div>
      </section>
    </main>
  );
}
