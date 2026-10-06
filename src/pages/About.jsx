import { Link } from "react-router-dom";
import { createElement } from "react";
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiLayers, FiLock, FiRepeat, FiUsers } from "react-icons/fi";
import revisionLoop from "../assets/revision-loop/revision-loop.png";
import "../styles/CommunityPages.css";
import "../styles/About.css";

const revisionRoute = [
  {
    icon: FiBookOpen,
    number: "01",
    title: "Understand",
    text: "Start with a focused explanation that makes the difficult part easier to see.",
  },
  {
    icon: FiRepeat,
    number: "02",
    title: "Remember",
    text: "Use flashcards to bring the key ideas back before they begin to fade.",
  },
  {
    icon: FiLayers,
    number: "03",
    title: "Practise",
    text: "Apply the idea through original questions, with a clear route back when something is missed.",
  },
  {
    icon: FiCheckCircle,
    number: "04",
    title: "Know what is next",
    text: "See what is secure, what needs another look, and where the next useful session should begin.",
  },
];

export default function About() {
  return (
    <main className="community-page about-page">
      <section className="community-hero about-hero community-hero-band">
        <div className="community-hero-copy">
          <span className="community-kicker">Why StudyForge exists</span>
          <h1>Revision that knows what comes next.</h1>
          <p className="community-lead">StudyForge connects learning, recall, and practice into one calm route, so students can spend less energy organising revision and more energy understanding it.</p>
          <div className="community-actions">
            <Link className="community-primary" to="/subjects/maths">Explore StudyForge <FiArrowRight /></Link>
            <Link className="community-secondary" to="/join">Help us build it</Link>
          </div>
        </div>
        <div className="about-system-card">
          <span className="about-system-label">The revision loop</span>
          <img src={revisionLoop} alt="The StudyForge revision loop connecting learning, recall, and practice" />
          <div><strong>One connected workspace</strong><span>Notes, flashcards, questions, and progress work together.</span></div>
        </div>
      </section>

      <section className="about-principles" aria-label="StudyForge principles">
        <article><strong>Clear by design</strong><span>Focused pages, readable explanations, fewer distractions.</span></article>
        <article><strong>Connected by default</strong><span>Each activity leads naturally to the next useful step.</span></article>
        <article><strong>Private where it matters</strong><span>Independent revision stays separate from assigned work.</span></article>
      </section>

      <section className="community-section about-route">
        <header className="community-section-heading community-section-heading-wide">
          <span className="community-kicker">A complete revision route</span>
          <h2>One topic. Four useful moves.</h2>
          <p>Each part has a specific purpose. Together, they turn a revision session into a repeatable system rather than a collection of disconnected resources.</p>
        </header>
        <div className="about-route-grid">
          {revisionRoute.map(({ icon: Icon, number, title, text }) => (
            <article key={number}>
              <div className="about-route-top"><span>{number}</span>{createElement(Icon)}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-boundary">
        <div className="about-boundary-copy">
          <span className="community-kicker">A deliberate boundary</span>
          <h2>Support from teachers. Space for students.</h2>
          <p>Assigned homework can show completion and question-level results. Independent revision remains private, giving students room to make mistakes and learn without every click becoming a report.</p>
          <div className="about-boundary-points"><span><FiUsers /> Useful classroom evidence</span><span><FiLock /> Private independent revision</span></div>
        </div>
        <div className="about-boundary-note">
          <FiCheckCircle />
          <strong>Built with the people who use it.</strong>
          <p>Students help test clarity. Designers make difficult ideas easier to see. Developers turn that feedback into a better learning experience.</p>
          <Link to="/join">See how students contribute <FiArrowRight /></Link>
        </div>
      </section>

      <section className="community-cta community-cta-panel"><div><span className="community-kicker">Shape the next version</span><h2>There is more than one way to make learning clearer.</h2><p>Bring student perspective, visual thinking, or technical skill to the team building StudyForge.</p></div><Link className="community-primary" to="/join">Find your place <FiArrowRight /></Link></section>
    </main>
  );
}
