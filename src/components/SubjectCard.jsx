import { Link } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiLock } from "react-icons/fi";
import { subjectIcons } from "../data/subjectVisuals";
import verifiedBadge from "../assets/twitter-verified-badge.webp";
import "../styles/SubjectCards.css";

export default function SubjectCard({ subject, to, metadata, locked = false, lockMessage = "Unavailable for now", className = "" }) {
  const SubjectIcon = subjectIcons[subject.id] || FiBookOpen;
  const isVerified = subject.id === "maths";
  const content = <><span className="subject-card-icon"><SubjectIcon /></span><span className="subject-card-copy"><small>{subject.qualification}{subject.id !== "maths" ? " Science" : ""}</small><strong>{subject.name}{isVerified && <img className="subject-card-verified" src={verifiedBadge} alt="Verified Maths source" />}</strong><span>{metadata}</span></span><FiArrowRight className="subject-card-arrow" aria-hidden="true" /></>;

  if (locked) {
    return <article className={`subject-card subject-card--locked ${className}`.trim()} style={{ "--subject-card-color": subject.color, "--subject-card-secondary": subject.secondaryColor }}>
      {content}
      <span className="subject-card-status"><FiLock />{lockMessage}</span>
    </article>;
  }

  return (
    <Link
      className={`subject-card ${className}`.trim()}
      style={{ "--subject-card-color": subject.color, "--subject-card-secondary": subject.secondaryColor }}
      to={to}
    >
      {content}
    </Link>
  );
}
