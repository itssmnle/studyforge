import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import subjects from "../data/subjects.json";
import "../Styles/NotePage.css";

export default function NotePage() {

  useEffect(() => {
    const title = document.querySelector(".notepage-title");
    if (!title) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) title.classList.add("visible");
      },
      { threshold: 0.3 }
    );

    observer.observe(title);
  }, []);

    useEffect(() => {
    const targets = document.querySelectorAll(".fade-in-on-scroll");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0 }
    );

    targets.forEach(el => observer.observe(el));
  }, []);

  return (
    <>

    {/* INTRO SECTION */}
    <section className="notes-intro">
      <div className="notes-intro-left fade-in-on-scroll">
        <h1 className="notes-intro-title">
          Revision Notes to <br />
          <span>boost your grades</span>
        </h1>

        <p className="notes-intro-text">
          Revision Notes are organised around exam specifications and cover every topic
          you need to know. Packed with helpful examples, examiner tips and engaging
          diagrams and videos, they’re designed to fill crucial knowledge gaps to help
          you improve your grades.
        </p>

        <div className="notes-intro-points">
          <div className="notes-intro-point">
            <FiCheck /> Written by expert teachers and examiners
          </div>
          <div className="notes-intro-point">
            <FiCheck /> Aligned to exam specifications
          </div>
          <div className="notes-intro-point">
            <FiCheck /> Everything you need to know, and nothing you don’t
          </div>
        </div>

        <button
          className="notes-intro-btn"
            onClick={() => {
              const section = document.getElementById("subjects");
              if (!section) return;

              const yOffset = 0; // ✅ push further DOWN
              const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

              window.scrollTo({
                top: y,
                behavior: "smooth"
              });
            }}
        >
          Explore Revision Notes
        </button>
      </div>

      <div className="notes-intro-right">
        <img
          src="src/assets/pointing.png"
          alt="Notes preview"
          className="notes-intro-image"
        />
      </div>
    </section>


    {/* SUBJECTS SECTION (UNCHANGED) */}
    <div className="subjects-page" id="subjects">
      <h1 className="notepage-title">
        Browse <span className="highlight-span">Revision Notes</span> by subject
      </h1>

      <div className="subjects-list">
        {subjects.map((s, i) => (
          <Link to={`/notes/${s.toLowerCase()}`} className="subject-card" key={i}>
            {s} Revision Notes
            <FiArrowRight className="arrow" />
          </Link>
        ))}
      </div>

      <button className="more-btn">View more subjects</button>
    </div>

    </>
  );
}
