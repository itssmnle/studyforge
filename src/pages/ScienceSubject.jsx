import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiLayers, FiTarget } from "react-icons/fi";
import { findSubject } from "../data/scienceCurriculum";
import { mathsSubject } from "../data/subjectConfig";
import { syllabusForSubject, syllabusYears } from "../data/courseSyllabus";
import verifiedBadge from "../assets/twitter-verified-badge.webp";
import SubjectCourseSidebar from "../components/SubjectCourseSidebar";
import "../styles/Platform.css";
import "../styles/SubjectOverview.css";

export default function ScienceSubject() {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [activeYear, setActiveYear] = useState("year-7");
  const { subject: subjectId } = useParams();
  const subject = findSubject(subjectId) || (subjectId === "maths" ? mathsSubject : null);
  if (!subject) return <Navigate to="/subjects/maths" replace />;

  const isMaths = subject.id === "maths";
  const syllabus = syllabusForSubject(subject.id, activeYear);
  const resources = [
    { label: "Revision Notes", description: `Read structured ${subject.name} notes by chapter and topic.`, icon: FiBookOpen, to: isMaths ? "/notes/maths" : `/notes/${subject.id}`, action: "Open revision notes" },
    { label: "Flashcards", description: `Recall key ${subject.name} terms and ideas one deck at a time.`, icon: FiLayers, to: `/flashcards/${subject.name}`, action: "Open flashcards" },
    { label: "Practice Questions", description: "Answer short question sets and receive immediate feedback.", icon: FiTarget, to: `/examquestions?subject=${subject.id}`, action: "Start practice" },
  ];

  return (
    <main className="academy-dashboard subject-hub-page" style={{ "--primary": subject.color, "--primary-dark": `color-mix(in srgb, ${subject.color} 84%, black)`, "--subject-color": subject.color, "--subject-secondary": subject.secondaryColor }}>
      <div className={`dashboard-layout subject-hub-layout${menuCollapsed ? " menu-collapsed" : ""}`}>
        <SubjectCourseSidebar key={subject.id} subject={subject} activeResource="overview" onCollapsedChange={setMenuCollapsed} />
        <section className="course-workspace subject-hub-workspace">
          <header className="subject-course-heading">
            <span className="workspace-kicker">{subject.qualification}{isMaths ? "" : " Science"}</span>
            <h1>{subject.name}{isMaths ? <img src={verifiedBadge} alt="Verified Maths source" /> : null}</h1>
            <p>{subject.description}</p>
          </header>
          <div className="subject-course-title-row">
            <div><span className="workspace-kicker">Course resources</span><h2>Study {subject.name}</h2></div>
          </div>
          <div className="subject-resource-grid">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link className="subject-resource-card" to={resource.to} key={resource.label}>
                  <span className="subject-resource-icon"><Icon /></span>
                  <h3>{resource.label}</h3>
                  <p>{resource.description}</p>
                  <strong>{resource.action} <span aria-hidden="true">→</span></strong>
                </Link>
              );
            })}
          </div>
          <section className="syllabus-map" aria-labelledby="syllabus-map-title">
            <header className="syllabus-map-heading">
              <div>
                <span className="workspace-kicker">Course map</span>
                <h2 id="syllabus-map-title">Syllabus by year</h2>
                <p>See the connected areas of learning, then open the revision notes for a focused topic.</p>
              </div>
              <nav className="syllabus-year-switcher" aria-label={`Choose ${subject.name} year group`}>
                {syllabusYears.map((year) => <button key={year} type="button" className={activeYear === year ? "active" : ""} aria-pressed={activeYear === year} onClick={() => setActiveYear(year)}>Year {year.slice(-1)}</button>)}
              </nav>
            </header>
            <div className="syllabus-map-intro">
              <span>Year {activeYear.slice(-1)}</span>
              <strong>{syllabus.focus}</strong>
              <small>{syllabus.units.length} syllabus areas</small>
            </div>
            <div className="syllabus-unit-grid">
              {syllabus.units.map((unit, index) => <article className="syllabus-unit" key={unit.id}>
                <span className="syllabus-unit-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{unit.title}</h3>
                <p>{unit.detail}</p>
                <div className="syllabus-topic-links">
                  {unit.topics.map((topic) => <Link to={topic.to} key={topic.id}>{topic.title}<FiArrowRight /></Link>)}
                </div>
              </article>)}
            </div>
          </section>
          <p className="subject-hub-note">Open resources without an account. Create one only when you want to save progress across devices.</p>
        </section>
      </div>
    </main>
  );
}
