import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import { findSubject } from "../data/scienceCurriculum";
import SubjectCourseSidebar from "./SubjectCourseSidebar";
import "../styles/Platform.css";
import "../styles/SubjectActivityShell.css";

const mathsSubject = {
  id: "maths",
  name: "Maths",
  qualification: "KS3",
  color: "#7c3aed",
  secondaryColor: "#f3efff",
  description: "Number, algebra, geometry, data and probability for Years 7 to 9.",
};

const subjectFromLocation = (pathname, search) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "notes") return parts[1];
  if (parts[0] === "flashcards") return parts[1]?.toLowerCase();
  if (parts[0] === "practice") return parts[1];
  if (parts[0] === "examquestions") return new URLSearchParams(search).get("subject");
  return null;
};

export default function SubjectActivityShell({ children }) {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const { pathname, search } = useLocation();
  const subjectId = subjectFromLocation(pathname, search);
  const subject = findSubject(subjectId) || (subjectId === "maths" ? mathsSubject : null);
  if (!subject) return children;

  const activeResource = pathname.startsWith(`/notes/${subject.id}`)
    ? "notes"
    : pathname.toLowerCase().startsWith(`/flashcards/${subject.id}`)
      ? "flashcards"
      : pathname.startsWith("/practice/") || pathname === "/examquestions"
        ? "practice"
        : "overview";

  return (
    <main
      className="academy-dashboard subject-activity-shell"
      style={{
        "--primary": subject.color,
        "--primary-dark": `color-mix(in srgb, ${subject.color} 84%, black)`,
        "--secondary": subject.secondaryColor,
        "--subject-color": subject.color,
        "--subject-secondary": subject.secondaryColor,
      }}
    >
      <div className={`dashboard-layout subject-activity-layout${menuCollapsed ? " menu-collapsed" : ""}`}>
        <SubjectCourseSidebar key={subject.id} subject={subject} activeResource={activeResource} onCollapsedChange={setMenuCollapsed} />
        <section className="course-workspace subject-activity-content">{children}</section>
      </div>
    </main>
  );
}
