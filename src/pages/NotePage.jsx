import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { FaCheck, FaLightbulb, FaPen } from "react-icons/fa";
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
          revision notes to <br />
          <span>boost your grades</span>
        </h1>

        <p className="notes-intro-text">
          Revision notes are organised around exam specifications and cover every topic
          you need to know. Packed with helpful examples, examiner tips and engaging
          diagrams and videos, they’re designed to fill crucial knowledge gaps to help
          you improve your grades.
        </p>

        <div className="notes-intro-points">
          <div className="notes-intro-point">
            <FaCheckCircle /> written by expert teachers and examiners
          </div>
          <div className="notes-intro-point">
            <FaCheckCircle /> aligned to exam specifications
          </div>
          <div className="notes-intro-point">
            <FaCheckCircle /> everything you need to know, and nothing you don’t
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

    <section className="notes-love-section fade-in-on-scroll">
      <h2 className="notes-love-title">
        Why students love our <span className="highlight">Revision Notes</span>
      </h2>

      <div className="notes-love-grid">
        <div className="notes-love-card">
          <div className="notes-love-icon">
            <FaCheck />
          </div>
          <h3>Written by expert teachers</h3>
          <p>
            Our Revision Notes are written by experienced teachers and examiners to
            explain exactly what you need to know — clearly and simply.
          </p>
        </div>

        <div className="notes-love-card">
          <div className="notes-love-icon">
            <FaLightbulb />
          </div>
          <h3>Perfectly exam-focused</h3>
          <p>
            Every topic is aligned to the exam specification, helping you focus on
            high-impact content and avoid unnecessary detail.
          </p>
        </div>

        <div className="notes-love-card">
          <div className="notes-love-icon">
            <FaPen />
          </div>
          <h3>Easy to revise from</h3>
          <p>
            Clear explanations, diagrams, and examples make tough topics easier to
            understand, remember, and apply in exams.
          </p>
        </div>
      </div>
    </section>

    {/* SUBJECTS SECTION (UNCHANGED) */}
    <div className="subjects-page" id="subjects">
      <h1 className="notepage-title">
        Browse <span className="highlight-span">Revision Notes</span> by subject
      </h1>
      <p className="notepage-title-desc">we're still updating this list as we go, make sure to keep an eye out!</p>
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
