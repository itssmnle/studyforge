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

    </section>
  );
}