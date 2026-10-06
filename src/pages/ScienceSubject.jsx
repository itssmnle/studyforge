import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiBookOpen, FiLayers, FiTarget } from "react-icons/fi";
import { findSubject } from "../data/scienceCurriculum";
import verifiedBadge from "../assets/twitter-verified-badge.webp";
import SubjectCourseSidebar from "../components/SubjectCourseSidebar";
import "../styles/Platform.css";
import "../styles/SubjectOverview.css";

const mathsSubject = {
  id: "maths",
  name: "Maths",
  qualification: "KS3",
  color: "#7c3aed",
  secondaryColor: "#f3efff",
  description: "Number, algebra, geometry, data and probability for Years 7 to 9.",
  topics: [],
};

export default function ScienceSubject() {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const { subject: subjectId } = useParams();
  const subject = findSubject(subjectId) || (subjectId === "maths" ? mathsSubject : null);
  if (!subject) return <Navigate to="/subjects/maths" replace />;

  const isMaths = subject.id === "maths";
  const resources = [
    { label: "Revision Notes", description: `Read structured ${subject.name} notes by chapter and topic.`, icon: FiBookOpen, to: isMaths ? "/notes/maths" : `/notes/${subject.id}`, action: "Open revision notes" },
    { label: "Flashcards", description: `Recall key ${subject.name} terms and ideas one deck at a time.`, icon: FiLayers, to: `/flashcards/${subject.name}`, action: "Open flashcards" },
    { label: "Practice Questions", description: "Answer short question sets and receive immediate feedback.", icon: FiTarget, to: `/examquestions?subject=${subject.id}`, action: "Start practice" },
  ];

  return (
    <main className="academy-dashboard subject-hub-page" style={{ "--primary": subject.color, "--primary-dark": `color-mix(in srgb, ${subject.color} 84%, black)`, "--secondary": subject.secondaryColor, "--subject-color": subject.color, "--subject-secondary": subject.secondaryColor }}>
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
          <p className="subject-hub-note">Open resources without an account. Create one only when you want to save progress across devices.</p>
        </section>
      </div>
    </main>
  );
}
