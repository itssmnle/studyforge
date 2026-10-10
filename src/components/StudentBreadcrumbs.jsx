import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import { findSubject, findTopic } from "../data/scienceCurriculum";
import { findNotesSubject } from "../data/noteSubjects";
import { mathLessons } from "../utils/mathLessonLibrary";
import flashcardDecks from "../data/flashcardDecks";

const titleFromSlug = (value) => decodeURIComponent(value || "")
  .replace(/[-_]+/g, " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const crumb = (label, to) => ({ label, to });
const subjectName = (id) => findSubject(id)?.name || (id === "maths" ? "Maths" : findNotesSubject(id)?.name) || titleFromSlug(id);
const subjectCrumb = (id, linked = true) => crumb(subjectName(id), linked ? `/subjects/${id}` : undefined);

function breadcrumbsFor(pathname, search) {
  if (pathname === "/" || pathname === "/launchpad" || pathname.startsWith("/teachers") || pathname === "/teacher-tools") return [];
  const parts = pathname.split("/").filter(Boolean);
  const trails = [crumb("Dashboard", "/launchpad")];

  if (parts[0] === "subjects") {
    trails.push(subjectCrumb(parts[1], false));
    return trails;
  }

  if (["learn", "science", "practice"].includes(parts[0]) && parts[1]) {
    const subjectId = parts[1];
    const topic = findTopic(subjectId, parts[2]);
    trails.push(subjectCrumb(subjectId));
    if (parts[2]) trails.push(crumb(topic?.name || titleFromSlug(parts[2])));
    return trails;
  }

  if (parts[0] === "notes") {
    if (!parts[1]) return [...trails, crumb("Revision notes")];
    if (parts[1] === "maths") {
      const year = parts[2] || new URLSearchParams(search).get("year");
      if (!year) return [...trails, subjectCrumb("maths", false)];
      const groupId = parts[3] === "group" ? parts[4] : parts[3];
      const group = mathLessons.find((item) => item.year === year && item.id === groupId);
      trails.push(subjectCrumb("maths"));
      trails.push(crumb(group?.title || titleFromSlug(groupId || year)));
      return trails;
    }
    const subjectId = parts[1];
    const topic = findTopic(subjectId, parts[2]);
    trails.push(subjectCrumb(subjectId, Boolean(parts[2])));
    if (parts[2]) trails.push(crumb(topic?.name || titleFromSlug(parts[2])));
    return trails;
  }

  if (parts[0] === "flashcards") {
    if (!parts[1]) return [...trails, crumb("Flashcards")];
    if (parts[1] === "custom") return [...trails, crumb("Custom flashcards")];
    const deckSubject = Object.keys(flashcardDecks).find((name) => name.toLowerCase() === parts[1].toLowerCase());
    const subjectId = deckSubject?.toLowerCase() || parts[1].toLowerCase();
    const deck = deckSubject && flashcardDecks[deckSubject].find((item) => item.id === parts[2]);
    trails.push(subjectCrumb(subjectId, Boolean(parts[2])));
    if (parts[2]) trails.push(crumb(deck?.title || titleFromSlug(parts[2])));
    return trails;
  }

  if (parts[0] === "examquestions") {
    const subjectId = new URLSearchParams(search).get("subject");
    return subjectId ? [...trails, subjectCrumb(subjectId, false)] : [...trails, crumb("Practice")];
  }

  const labels = {
    "my-notes": "My notes",
    mockexams: "Mock exams",
    pastpapers: "Past papers",
    settings: "Account settings",
    ambassadors: "Ambassadors",
    join: "Join Kojonote",
    about: "About us",
  };
  trails.push(crumb(labels[parts[0]] || titleFromSlug(parts[0])));
  return trails;
}

export default function StudentBreadcrumbs() {
  const { user } = useAuthModal();
  const { pathname, search } = useLocation();
  if (user?.role === "teacher") return null;
  const trails = breadcrumbsFor(pathname, search);
  if (!trails.length) return null;

  return <nav className="student-breadcrumbs" aria-label="Breadcrumb"><ol>{trails.map((item, index) => {
    const current = index === trails.length - 1;
    return <li key={`${item.label}-${index}`}>{index > 0 && <FiChevronRight aria-hidden="true" />}{current || !item.to ? <span aria-current="page">{index === 0 && <FiHome aria-hidden="true" />}{item.label}</span> : <Link to={item.to}>{index === 0 && <FiHome aria-hidden="true" />}{item.label}</Link>}</li>;
  })}</ol></nav>;
}
