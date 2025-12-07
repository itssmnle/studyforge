import { useState, useEffect, useRef } from "react";
import "../styles/Navbar.css";
import logo from "../transparent-logo.svg";
import { FaBookOpen, FaQuestionCircle, FaRegClone, FaFileAlt, FaClipboardList } from "react-icons/fa";
import { MdStarRate } from "react-icons/md";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <nav className="navbar" ref={navRef} onClick={(e) => e.stopPropagation()}>
        <div className="nav-left">
          <div className="logo">
            <a href="/"><img src={logo} alt="logo" /></a>
          </div>

          <div
            className={`nav-item dropdown ${openMenu === "study" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === "study" ? null : "study");
            }}
          >
            start studying <span className="arrow">▾</span>

            <div className={`dropdown-menu ${openMenu === "study" ? "show" : ""}`}>
              <a href="/notes"><FaBookOpen className="dd-icon" /> revision notes</a>
              <a href="#"><FaQuestionCircle className="dd-icon" /> exam questions</a>
              <a href="#"><FaRegClone className="dd-icon" /> flashcards</a>
              <a href="#"><FaFileAlt className="dd-icon" /> past papers</a>
              <a href="#"><FaClipboardList className="dd-icon" /> mock exams</a>
            </div>
          </div>
        </div>

        <div className="nav-center">
          <input type="text" className="search-box" placeholder="search for a subject..." />
        </div>

        <div className="nav-right">
          <a href="#">my account</a>
        </div>
      </nav>
    </>
  );
}