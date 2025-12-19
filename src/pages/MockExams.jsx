import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  FaCheckCircle,
  FaClipboardCheck,
  FaStopwatch,
  FaBullseye
} from "react-icons/fa";
import exams from "../data/subjects.json";
import "../Styles/MockExams.css";

export default function MockExamPage() {
  useEffect(() => {
    const title = document.querySelector(".mockpage-title");
    if (!title) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && title.classList.add("visible"),
      { threshold: 0.3 }
    );

    observer.observe(title);
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll(".fade-in-on-scroll");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    });

    targets.forEach(el => observer.observe(el));
  }, []);

  return (
    <>
      {/* INTRO */}
      <section className="mock-intro">
        <div className="mock-intro-inner">
          <div className="mock-intro-left fade-in-on-scroll">
            <h1 className="mock-intro-title">
              mock exams to <br />
              <span className="bold">master exam day</span>
            </h1>

            <p className="mock-intro-text">
              Our Mock Exams recreate real exam conditions so you can practise
              timing, refine technique, and walk into your exam confident and prepared.
            </p>

            <div className="mock-intro-points">
              <div className="mock-intro-point">
                <FaCheckCircle /> written by examiners
              </div>
              <div className="mock-intro-point">
                <FaCheckCircle /> realistic exam conditions
              </div>
              <div className="mock-intro-point">
                <FaCheckCircle /> detailed feedback & insights
              </div>
            </div>

            <button
              className="mock-intro-btn"
              onClick={() => {
                const section = document.getElementById("mock-exams");
                if (!section) return;
                const y = section.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }}
            >
              Explore Mock Exams
            </button>
          </div>

          <div className="mock-intro-right">
            <img
              src="src/assets/pointing.png"
              alt="Mock exam preview"
              className="mock-intro-image"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mock-benefits fade-in-on-scroll">
        <h2 className="mock-benefits-title">
          Why Mock Exams <span className="highlight">work</span>
        </h2>

        <div className="mock-benefits-grid">
          <div className="mock-benefit-card">
            <div className="mock-benefit-icon simulate">
              <FaClipboardCheck />
            </div>
            <h3>Simulate the real exam</h3>
            <p>
              Full-length papers that match the real exam’s structure, difficulty,
              and marking criteria.
            </p>
          </div>

          <div className="mock-benefit-card">
            <div className="mock-benefit-icon timing">
              <FaStopwatch />
            </div>
            <h3>Improve timing</h3>
            <p>
              Learn how to pace yourself, allocate time effectively, and avoid
              exam-day mistakes.
            </p>
          </div>

          <div className="mock-benefit-card">
            <div className="mock-benefit-icon target">
              <FaBullseye />
            </div>
            <h3>Target weak areas</h3>
            <p>
              Actionable feedback shows exactly where you’re losing marks — and how
              to fix it.
            </p>
          </div>
        </div>
      </section>

      {/* MOCK EXAMS LIST */}
      <section className="subjects-page" id="mock-exams">
        <h1 className="mockpage-title">
          Browse <span className="highlight-span">Mock Exams</span> by subject
        </h1>

        <p className="notepage-title-desc">
          more mock exams are added regularly — keep checking back!
        </p>

        <div className="subjects-list">
          {exams.map((e, i) => (
            <Link
              to={`/mock-exams/${e.toLowerCase()}`}
              className="subject-card"
              key={i}
            >
              {e} Mock Exam
              <FiArrowRight className="arrow" />
            </Link>
          ))}
        </div>

        <button className="more-btn">View more mock exams</button>
      </section>
    </>
  );
}
