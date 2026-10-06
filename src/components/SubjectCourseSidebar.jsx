import { useState } from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiChevronDown, FiLayers, FiSidebar, FiTarget } from "react-icons/fi";
import { findSubject } from "../data/scienceCurriculum";
import { subjectIcons } from "../data/subjectVisuals";
import "../styles/SubjectCourseSidebar.css";

const subjectIds = ["maths", "biology", "chemistry", "physics"];

const subjectName = (id) => id === "maths" ? "Maths" : findSubject(id)?.name;
const subjectColor = (id) => id === "maths" ? "#7c3aed" : findSubject(id)?.color;

export default function SubjectCourseSidebar({ subject, activeResource, onCollapsedChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const isMaths = subject.id === "maths";
  const SubjectIcon = subjectIcons[subject.id] || FiBookOpen;
  const resources = [
    { id: "notes", label: "Revision Notes", icon: FiBookOpen, to: isMaths ? "/notes/maths" : `/notes/${subject.id}` },
    { id: "flashcards", label: "Flashcards", icon: FiLayers, to: `/flashcards/${subject.name}` },
    { id: "practice", label: "Practice Questions", icon: FiTarget, to: `/examquestions?subject=${subject.id}` },
  ];

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside className={`subject-course-sidebar${collapsed ? " is-collapsed" : ""}`} aria-label={`${subject.name} course navigation`}>
      <button className="subject-menu-toggle" type="button" onClick={toggleCollapsed} aria-expanded={!collapsed}>
        <FiSidebar />
        <span>{collapsed ? "Show menu" : "Hide menu"}</span>
      </button>

      <span className="subject-sidebar-label">Course</span>
      <details className="subject-switcher">
        <summary aria-label={`Switch from ${subject.name}`} title={collapsed ? subject.name : undefined}>
          <SubjectIcon />
          <span>{subject.name}</span>
          <FiChevronDown className="subject-switcher-chevron" />
        </summary>
        <div className="subject-switcher-options">
          {subjectIds.filter((id) => id !== subject.id).map((id) => {
            const Icon = subjectIcons[id] || FiBookOpen;
            return <Link to={`/subjects/${id}`} style={{ "--switcher-subject-color": subjectColor(id) }} key={id}><Icon /><span>{subjectName(id)}</span></Link>;
          })}
        </div>
      </details>

      <nav className="subject-resource-nav" aria-label={`${subject.name} resources`}>
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <div className={resource.id === "notes" ? "subject-resource-group" : undefined} key={resource.id}>
              {resource.id === "notes" ? <span className="subject-sidebar-label">Revision</span> : null}
              <Link className={activeResource === resource.id ? "active" : ""} aria-current={activeResource === resource.id ? "page" : undefined} aria-label={resource.label} title={collapsed ? resource.label : undefined} to={resource.to}>
                <Icon />
                <span>{resource.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
