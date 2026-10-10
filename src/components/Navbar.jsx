import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBookOpen, FiChevronDown, FiInfo, FiLayers, FiLogOut, FiSearch, FiSettings, FiTarget, FiUser } from "react-icons/fi";
import logoLight from "../logo-light.webp";
import logoDark from "../logo-dark.webp";
import teacherLogoLight from "../logo-teachers-light.webp";
import teacherLogoDark from "../logo-teachers-dark.webp";
import { useAuthModal } from "../context/AuthModalContext";
import { noteSubjects } from "../data/noteSubjects";
import { subjectIcons } from "../data/subjectVisuals";
import "../styles/Navbar.css";

const exploreSubjectIds = ["maths", "biology", "chemistry", "physics"];
const searchIcons = { notes: FiBookOpen, flashcards: FiLayers, practice: FiTarget, info: FiInfo, account: FiUser };

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { openLogin, user, logout } = useAuthModal();
  const isTeacherArea = user?.role === "teacher" || location.pathname.startsWith("/teacher-tools");
  const searchTerm = query.trim();

  useEffect(() => {
    let active = true;
    if (!searchTerm) { setSearchResults([]); return () => { active = false; }; }
    import("../utils/searchLibrary").then(({ searchStudyForge }) => {
      if (active) setSearchResults(searchStudyForge(searchTerm));
    });
    return () => { active = false; };
  }, [searchTerm]);

  useEffect(() => {
    const close = () => {
      setOpenMenu(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const search = (event) => {
    event.preventDefault();
    if (searchResults[0]) {
      navigate(searchResults[0].to);
      setQuery("");
    }
  };
  const closeExplore = () => {
    setOpenMenu((menu) => menu === "explore" ? null : menu);
  };
  const studentFeatures = [
    { to: "/notes", icon: FiBookOpen, label: "Revision notes" },
    { to: "/flashcards", icon: FiLayers, label: "Flashcards" },
    { to: "/examquestions", icon: FiTarget, label: "Practice questions" },
  ];
  const exploreFeatures = user?.role === "teacher" ? [{ to: "/notes", icon: FiBookOpen, label: "Revision notes" }] : studentFeatures;

  return (
    <nav className="navbar academy-nav" ref={navRef} onClick={(event) => event.stopPropagation()}>
      {openMenu === "explore" && <button className="explore-backdrop" aria-label="Close Explore menu" onClick={closeExplore} />}
      <div className="nav-inner">
        <div className="nav-zone nav-zone-left">
          <div className="explore-wrap">
            <button className={`explore-button ${openMenu === "explore" ? "active" : ""}`} aria-expanded={openMenu === "explore"} aria-controls="explore-menu" onClick={() => setOpenMenu(menu => menu === "explore" ? null : "explore")}>
              Explore <FiChevronDown />
            </button>
            <div className={`explore-menu ${openMenu === "explore" ? "show" : ""}`} id="explore-menu">
              <section className="explore-feature-column"><span>Features</span>{exploreFeatures.map((feature) => { const FeatureIcon = feature.icon; return <Link to={feature.to} key={feature.to} onClick={closeExplore}><FeatureIcon />{feature.label}</Link>; })}<Link to="/about" onClick={closeExplore}><FiInfo />About us</Link></section>
              {user?.role !== "teacher" && <section className="explore-subject-column"><span>Subjects</span>{exploreSubjectIds.map((id) => noteSubjects.find((subject) => subject.id === id)).filter(Boolean).map((subject) => { const SubjectIcon = subjectIcons[subject.id]; return <Link to={`/subjects/${subject.id}`} key={subject.id} onClick={closeExplore} style={{ "--subject-color": subject.color, "--subject-secondary": subject.secondaryColor }}><SubjectIcon className="course-dot" /><span className="explore-subject-name">{subject.name}{subject.id === "maths" ? <span className="explore-new-badge">New</span> : null}</span></Link>; })}</section>}
            </div>
          </div>
          {user?.role !== "teacher" && <form className="nav-search" onSubmit={search}><FiSearch /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search everything" aria-label="Search all Kojonote resources" aria-expanded={Boolean(searchTerm)} aria-controls="course-search-results" />{searchTerm && <div className="nav-search-results" id="course-search-results" role="listbox">{searchResults.map((result) => { const Icon = searchIcons[result.icon] || FiSearch; return <Link role="option" to={result.to} key={result.id} onClick={() => setQuery("")}><Icon /><span><strong>{result.label}</strong><small>{result.detail}</small></span></Link>; })}{!searchResults.length && <p>No matching resources.</p>}</div>}</form>}
        </div>

        <Link className={`nav-brand ${isTeacherArea ? "teacher-brand" : ""}`} to={isTeacherArea ? "/teacher-tools" : "/"} aria-label={isTeacherArea ? "Kojonote For Teachers" : "Kojonote home"}>
          {isTeacherArea ? <><img className="nav-brand-light" src={teacherLogoLight} alt="Kojonote For Teachers" /><img className="nav-brand-dark" src={teacherLogoDark} alt="Kojonote For Teachers" /></> : <><img className="nav-brand-light" src={logoLight} alt="Kojonote" /><img className="nav-brand-dark" src={logoDark} alt="Kojonote" /></>}
        </Link>

        <div className="nav-zone nav-zone-right">
          {!user && <Link className="workspace-switch" to={isTeacherArea ? "/" : "/teacher-tools"}>{isTeacherArea ? "For students" : "For teachers"}</Link>}
          {user ? (
            <div className="account-wrap">
              <button className="account-button" onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}>{user.username} <FiChevronDown /></button>
              <div className={`account-menu ${openMenu === "account" ? "show" : ""}`}>
                <Link to={user.role === "teacher" ? "/teachers" : "/launchpad"}><FiUser /> {user.role === "teacher" ? "Teacher dashboard" : "My courses"}</Link>
                <Link to="/settings"><FiSettings /> Settings</Link>
                <button onClick={() => { logout(); setOpenMenu(null); }}><FiLogOut /> Log out</button>
              </div>
            </div>
          ) : (
            <button className="nav-login" onClick={() => openLogin("login")}>Log in</button>
          )}
        </div>
      </div>
    </nav>
  );
}
