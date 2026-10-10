import "../styles/Footer.css";
import { Link } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import logoLight from "../logo-light.webp";
import logoDark from "../logo-dark.webp";

export default function Footer() {
  const { user } = useAuthModal();
  const isTeacher = user?.role === "teacher";

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand-column">
          <Link className="footer-brand" to="/" aria-label="Kojonote home">
            <img className="footer-brand-light" src={logoLight} alt="Kojonote" />
            <img className="footer-brand-dark" src={logoDark} alt="Kojonote" />
          </Link>
          <p>Clear revision notes, flashcards, and short practice sets for focused study.</p>
        </div>

        {!isTeacher && <div className="footer-col">
          <h4>Resources</h4>
          <Link to="/notes">Revision notes</Link>
          <Link to="/flashcards">Flashcards</Link>
          <Link to="/examquestions">Practice</Link>
        </div>}

        {!isTeacher && <div className="footer-col">
          <h4>Subjects</h4>
          <Link to="/subjects/maths">Maths</Link>
          <Link to="/subjects/biology">Biology</Link>
          <Link to="/subjects/chemistry">Chemistry</Link>
          <Link to="/subjects/physics">Physics</Link>
        </div>}

        <div className="footer-col">
          <h4>Kojonote</h4>
          <Link to="/about">About us</Link>
          <Link to="/join">Join the team</Link>
          {!user && <Link to="/teacher-tools">For teachers</Link>}
          {user && <Link to={isTeacher ? "/teachers" : "/launchpad"}>{isTeacher ? "Teacher dashboard" : "My courses"}</Link>}
          {user && <Link to="/settings">Account settings</Link>}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Kojonote. All rights reserved.</p>
        <p>Designed for calm, focused revision.</p>
      </div>
    </footer>
  );
}
