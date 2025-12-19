import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  FaCheckCircle,
  FaFileAlt,
  FaSearch,
  FaChartLine
} from "react-icons/fa";
import subjects from "../data/subjects.json";
import "../Styles/PastPapers.css";

export default function PastPapersPage() {
  useEffect(() => {
    const title = document.querySelector(".pastpage-title");
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
      <section className="past-intro">
        <div className="past-intro-inner">
          <div className="past-intro-left fade-in-on-scroll">
            <h1 className="past-intro-title">
              past papers to <br />
              <span className="bold">perfect your technique</span>
            </h1>

            <p className="past-intro-text">
              Practise with real past papers used in previous exams to understand
              question styles, common pitfalls, and mark schemes.
            </p>

            <div className="past-intro-points">
              <div className="past-intro-point">
                <FaCheckCircle /> official exam-style questions
              </div>
              <div className="past-intro-point">
                <FaCheckCircle /> real marking schemes
              </div>
              <div className="past-intro-point">
                <FaCheckCircle /> perfect for exam practice
              </div>
            </div>

            <button
              className="past-intro-btn"
              onClick={() => {
                const section = document.getElementById("past-papers");
                if (!section) return;
                const y = section.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }}
            >
              Explore Past Papers
            </button>
          </div>

          <div className="past-intro-right">
            <img
              src="src/assets/pointing.png"
              alt="Past papers preview"
              className="past-intro-image"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="past-benefits fade-in-on-scroll">
        <h2 className="past-benefits-title">
          Why Past Papers <span className="highlight">matter</span>
        </h2>

        <div className="past-benefits-grid">
          <div className="past-benefit-card">
            <div className="past-benefit-icon papers">
              <FaFileAlt />
            </div>
            <h3>Real exam questions</h3>
            <p>
              Work through questions that have appeared in real exams to understand
              exactly what examiners expect.
            </p>
          </div>

          <div className="past-benefit-card">
            <div className="past-benefit-icon analysis">
              <FaSearch />
            </div>
            <h3>Understand mark schemes</h3>
            <p>
              Learn how marks are awarded so you can structure answers clearly and
              efficiently.
            </p>
          </div>

          <div className="past-benefit-card">
            <div className="past-benefit-icon progress">
              <FaChartLine />
            </div>
            <h3>Track progress</h3>
            <p>
              Repeating past papers helps identify weak topics and measure real
              improvement over time.
            </p>
          </div>
        </div>
      </section>

      {/* PAST PAPERS LIST */}
      <section className="subjects-page" id="past-papers">
        <h1 className="pastpage-title">
          Browse <span className="highlight-span">Past Papers</span> by subject
        </h1>

        <p className="notepage-title-desc">
          we’re adding more past papers regularly — stay tuned!
        </p>

        <div className="subjects-list">
          {subjects.map((s, i) => (
            <Link
              to={`/past-papers/${s.toLowerCase()}`}
              className="subject-card"
              key={i}
            >
              {s} Past Papers
              <FiArrowRight className="arrow" />
            </Link>
          ))}
        </div>

        <button className="more-btn">View more past papers</button>
      </section>
    </>
  );
}
