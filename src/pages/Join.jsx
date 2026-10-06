import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiMessageCircle,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import "../styles/CommunityPages.css";
import "../styles/JoinIllustration.css";
import developmentIllustration from "../assets/revision-loop/devteam.svg";
import designIllustration from "../assets/revision-loop/designteam.svg";
import ambassadorIllustration from "../assets/revision-loop/ambassador.svg";

const teams = [
  { illustration: developmentIllustration, title: "Development team", text: "Build the tools that make high-quality revision easier to create, check, and improve." },
  { illustration: designIllustration, title: "Design team", text: "Create thoughtful graphics, layouts, and revision material that make difficult ideas easier to understand." },
  { illustration: ambassadorIllustration, title: "Student ambassadors", text: "Review material from a student perspective and help us verify that it is clear, accurate, and useful." },
];

const ambassadorChecks = [
  "Read revision notes with a student’s perspective",
  "Flag confusing explanations, missing steps, or errors",
  "Suggest clearer examples and more useful practice prompts",
];

export default function Join() {
  return (
    <main className="community-page join-page">
      <div className="join-flow join-flow-one" aria-hidden="true" />
      <div className="join-flow join-flow-two" aria-hidden="true" />

      <section className="community-section join-teams" id="roles">
        <header className="community-section-heading community-section-heading-wide">
          <span className="community-kicker">Find your place</span>
          <h2>Different skills, one learning community.</h2>
          <p>Keep the role that matches your strengths, then work alongside the people approaching the same problem from another angle.</p>
        </header>
        <div className="community-grid join-team-grid">
          {teams.map(({ illustration, title, text }, index) => (
            <article className="community-card community-team-card" key={title}>
              <span className="community-team-number">0{index + 1}</span>
              <img className="community-team-illustration" src={illustration} alt="" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="join-expectations">
        <header><span className="community-kicker">How contributing works</span><h2>Useful work, without the theatre.</h2></header>
        <div>
          <article><FiClock /><strong>Start with a focused task</strong><p>Work on a clear piece of content, design, or product improvement rather than an open-ended brief.</p></article>
          <article><FiMessageCircle /><strong>Share feedback early</strong><p>Show the work while it is still easy to improve and explain the thinking behind your choices.</p></article>
          <article><FiCheckCircle /><strong>Finish with something usable</strong><p>Every contribution should leave students with a clearer explanation, better tool, or smoother experience.</p></article>
        </div>
      </section>

      <section className="join-ambassador-feature" id="student-ambassadors">
        <div className="ambassadors-hero-card">
          <span className="ambassadors-card-label">Student reviewed</span>
          <img src={ambassadorIllustration} alt="A student ambassador reading with a stack of books" />
          <blockquote>“Would this have made sense before I already knew the answer?”</blockquote>
          <p>That is the standard student ambassadors help us apply.</p>
        </div>
        <div className="join-ambassador-copy">
          <header className="community-section-heading">
            <span className="community-kicker">Student voice at StudyForge</span>
            <h2>Read it. Question it. Improve it.</h2>
            <p>You do not need to be a subject expert. You need to notice where a student could lose the thread and explain what would make the material more useful.</p>
          </header>
          <div className="ambassadors-process">
            <article><span>01</span><FiEdit3 /><div><h3>Review a real resource</h3><p>Work through a focused note, example, question set, or product flow as a student would.</p></div></article>
            <article><span>02</span><FiMessageSquare /><div><h3>Explain where it loses you</h3><p>Flag confusing wording, skipped steps, weak examples, or anything that feels harder than it needs to be.</p></div></article>
            <article><span>03</span><FiCheckCircle /><div><h3>Check the improved version</h3><p>See what changed and confirm whether the revision now feels clearer and more trustworthy.</p></div></article>
          </div>
        </div>
      </section>

      <section className="ambassadors-fit">
        <div className="ambassadors-fit-copy">
          <span className="community-kicker">What student ambassadors do</span>
          <h2>Your experience helps set the standard.</h2>
          <ul>{ambassadorChecks.map((check) => <li key={check}><FiCheckCircle />{check}</li>)}</ul>
        </div>
        <div className="ambassadors-fit-card">
          <FiUsers />
          <span className="community-kicker">You could be a good fit if</span>
          <strong>You are curious, specific, and willing to say when something does not make sense.</strong>
          <p>Ambassadors are not expected to know everything. Honest, well-explained feedback is more valuable than pretending a resource is already clear.</p>
        </div>
      </section>

      <section className="community-cta community-cta-panel">
        <div><span className="community-kicker">Shape the next version</span><h2>There is more than one way to make learning clearer.</h2><p>Bring student perspective, visual thinking, or technical skill to the team building StudyForge.</p></div>
        <a className="community-primary" href="mailto:s01752@bvisvietnam.com?subject=Contributing%20to%20StudyForge">Find your place <FiArrowRight /></a>
      </section>
    </main>
  );
}
