import { Link } from "react-router-dom";
import { createElement, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiLayers,
  FiLock,
  FiRepeat,
  FiUsers,
} from "react-icons/fi";
import revisionLoop from "../assets/revision-loop/revision-loop.png";
import rememberIllustration from "../assets/revision-loop/remember.svg";
import sharedIllustration from "../assets/revision-loop/shared.svg";
import developmentIllustration from "../assets/revision-loop/devteam.svg";
import designIllustration from "../assets/revision-loop/designteam.svg";
import ambassadorIllustration from "../assets/revision-loop/ambassador.svg";
import "../styles/CommunityPages.css";
import "../styles/About.css";

const revisionRoute = [
  {
    icon: FiBookOpen,
    number: "01",
    title: "Learn",
    text: "Start with a focused explanation of the idea you need to understand.",
  },
  {
    icon: FiRepeat,
    number: "02",
    title: "Recall",
    text: "Use flashcards to bring key knowledge back before it begins to fade.",
  },
  {
    icon: FiLayers,
    number: "03",
    title: "Practise",
    text: "Apply what you know through original questions and clear feedback.",
  },
  {
    icon: FiCheckCircle,
    number: "04",
    title: "Improve",
    text: "See what is secure, revisit what is not, and choose the next useful step.",
  },
];

const aboutSections = [
  ["study-tools", "Study tools"],
  ["our-approach", "Our approach"],
  ["our-mission", "Our mission"],
  ["join-us", "Join us"],
];

export default function About() {
  const [activeSection, setActiveSection] = useState(aboutSections[0][0]);

  return (
    <main className="community-page about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <span className="community-kicker">About StudyForge</span>
        <h1 id="about-title">Revision with a clear next step.</h1>
        <p>
          StudyForge is a revision workspace that brings <mark>learning, recall, and practice</mark> into one connected route. Students spend less time organising resources and more time working on what they need to understand.
        </p>
        <div className="about-intro-actions">
          <Link className="community-primary" to="/join">Help shape StudyForge <FiArrowRight /></Link>
        </div>
      </section>

      <nav className="about-index" aria-label="About page sections">
        <div role="tablist" aria-label="About StudyForge">
          {aboutSections.map(([id, label]) => (
            <button
              aria-controls="about-tab-panel"
              aria-selected={activeSection === id}
              className={activeSection === id ? "is-active" : undefined}
              id={`about-tab-${id}`}
              key={id}
              role="tab"
              type="button"
              onClick={() => setActiveSection(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div
        aria-labelledby={`about-tab-${activeSection}`}
        className="about-tab-panel"
        id="about-tab-panel"
        role="tabpanel"
      >
        {activeSection === "study-tools" && (
          <section className="about-feature">
            <header className="about-section-heading">
              <span className="community-kicker">Study tools</span>
              <h2>How we help students revise with purpose</h2>
              <p>Notes, flashcards, practice questions, and progress are connected around one topic. Each tool has a clear job and leads to a useful next action.</p>
            </header>

            <div className="about-loop-panel">
              <div className="about-loop-visual">
                <span>The StudyForge revision loop</span>
                <img src={revisionLoop} alt="Learn, practise, improve, and repeat" />
              </div>
              <div className="about-route-grid">
                {revisionRoute.map(({ icon: Icon, number, title, text }) => (
                  <article key={number}>
                    <div className="about-route-top"><span>{number}</span>{createElement(Icon)}</div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === "our-approach" && (
          <section className="about-editorial about-approach">
            <div className="about-approach-intro">
              <header>
                <span className="community-kicker">Our approach</span>
                <h2>Designed to reduce friction, not add more of it.</h2>
              </header>
              <div className="about-character-stage" aria-hidden="true">
                <img src={rememberIllustration} alt="" />
              </div>
            </div>
            <div className="about-principles" aria-label="StudyForge principles">
              <article><FiBookOpen /><strong>Clear by design</strong><span>Focused pages, readable explanations, and fewer distractions.</span></article>
              <article><FiRepeat /><strong>Connected by default</strong><span>Each activity leads naturally to the next useful step.</span></article>
              <article><FiCheckCircle /><strong>Precise about progress</strong><span>Results show what happened without pretending a score tells the whole story.</span></article>
            </div>
          </section>
        )}

        {activeSection === "our-mission" && (
          <section className="about-editorial about-mission">
            <div className="about-mission-copy">
              <span className="community-kicker">Our mission</span>
              <h2>Make effective revision easier to begin and easier to continue.</h2>
              <p>Students should be able to open a topic, understand the key idea, practise it, and know what to do next. StudyForge is being built around that practical loop.</p>
              <div className="about-boundary-points">
                <span><FiUsers /> Useful classroom evidence</span>
                <span><FiLock /> Private independent revision</span>
              </div>
            </div>
            <aside className="about-boundary-note">
              <div className="about-boundary-visual" aria-hidden="true">
                <FiLock />
                <img src={sharedIllustration} alt="" />
              </div>
              <strong>Support from teachers. Space for students.</strong>
              <p>Assigned work can show completion and question-level results. Independent revision remains private, giving students room to make mistakes and learn.</p>
            </aside>
          </section>
        )}

        {activeSection === "join-us" && (
          <section className="about-join">
            <div>
              <span className="community-kicker">Join us</span>
              <h2>Built with the people who use it.</h2>
              <p>Students test clarity. Designers make difficult ideas easier to see. Developers turn evidence and feedback into a better learning experience.</p>
            </div>
            <div className="about-join-side">
              <div className="about-team-characters" aria-label="Development, design, and student ambassador teams">
                <figure><img src={developmentIllustration} alt="" /><figcaption>Develop</figcaption></figure>
                <figure><img src={designIllustration} alt="" /><figcaption>Design</figcaption></figure>
                <figure><img src={ambassadorIllustration} alt="" /><figcaption>Review</figcaption></figure>
              </div>
              <div className="about-join-actions">
                <Link className="community-primary" to="/join">Help shape StudyForge <FiArrowRight /></Link>
                <Link className="community-secondary" to="/subjects/maths">Explore StudyForge</Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
