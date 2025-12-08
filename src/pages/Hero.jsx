// src/components/Hero.jsx
import React, { useEffect } from "react";
import { FaUsers, FaStar } from "react-icons/fa";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BiTrendingUp } from "react-icons/bi";
import { FiMessageSquare } from "react-icons/fi";
import "../styles/Hero.css";

export default function Hero() {

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
    <section className="hero">

      <div className="hero-top-badge fade-in-on-scroll">
        <FaStar className="star-icon" />
        new initiative!
      </div>

      <h1 className="hero-title fade-in-on-scroll">
        exam-specific revision,<br />
        <span>provided by BVIS teachers (& students)</span>
      </h1>

      <p className="hero-subtitle fade-in-on-scroll">
        note: this is still a developing website, so more features may roll out!
        we are more than delighted to receive contribution…
      </p>

      <div className="hero-buttons fade-in-on-scroll">
        <a className="btn-primary" href="/launchpad">join now for free</a>
        <a className="btn-secondary" href="/teachers">i'm a teacher</a>
      </div>

      {/* ⬇ NOW inside hero */}
      <div className="stats-wrap container fade-in-on-scroll">
        <div className="stats-inner">

          <div className="stat-card">
            <div className="stat-icon-bg pink"><FaUsers className="icon" /></div>
            <div className="stat-text">
              <div className="stat-title">3</div>
              <div className="stat-sub">loved by 3 students*</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg blue"><AiOutlineClockCircle className="icon" /></div>
            <div className="stat-text">
              <div className="stat-title">94%</div>
              <div className="stat-sub">94% say they save time*</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg green"><BiTrendingUp className="icon" /></div>
            <div className="stat-text">
              <div className="stat-title">2.6×</div>
              <div className="stat-sub">average grade improvement*</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-bg yellow"><FiMessageSquare className="icon" /></div>
            <div className="stat-text">
              <div className="stat-title">99%</div>
              <div className="stat-sub">would recommend StudyForge*</div>
            </div>
          </div>

        </div>
      </div>
            {/* --- WHY IT WORKS SECTION --- */}
      <section className="why-it-works container fade-in-on-scroll">
        <h2 className="why-title">Why it works</h2>

        <div className="why-grid">
          
          <div className="why-card">
            <div className="why-number">1</div>
            <h3>Revise</h3>
            <p className="why-sub">only what you need to</p>

            <p>
              Enjoy the <strong>relief and reassurance</strong> that every revision guide is written 
              specifically for the syllabus, so you only revise what you need to know.
            </p>

            <p className="why-quote">“Never felt so relieved in my life”</p>
            <p className="why-quote">
              “Quite literally has saved my exams on multiple occasions”
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">2</div>
            <h3>Test yourself</h3>
            <p className="why-sub">and check progress</p>

            <p>
              Feel <strong>empowered and confident</strong> going into exams knowing that 
              you’ve covered all the topics and have a greater understanding of each subject.
            </p>

            <p className="why-quote">
              “The tailored level of questions builds so much confidence within my students”
            </p>
          </div>

          <div className="why-card">
            <div className="why-number">3</div>
            <h3>Improve</h3>
            <p className="why-sub">answer by answer</p>

            <p>
              Gain <strong>certainty</strong> that you're answering questions that get 
              <strong> maximum marks</strong>, with model answers for every question explained by an expert examiner or teacher.
            </p>

            <p className="why-quote">
              “I went from a 6–7–7 in Year 10 to 9–9–9 for my real exams, only because of your superb resources”
            </p>
          </div>

        </div>
      </section>

    </section>
    
  );
}