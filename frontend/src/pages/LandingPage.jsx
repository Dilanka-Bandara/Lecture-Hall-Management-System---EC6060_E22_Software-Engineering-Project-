import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import people from "../assets/people.png";

const LandingPage = () => {

  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Lectro<span>.</span></div>

        <button className="signin-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </nav>


      {/* Hero Section */}
      <section className="hero">

        <div className="hero-left">

          <h1>
            Smart Lecture Hall <br /> Management System
          </h1>

          <p>
            Efficiently manage lecture halls, schedules, attendance and
            academic operations with ease.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>

          </div>

        </div>

        <div className="hero-right">
          <img src={people} alt="people" className="hero-image"/>
        </div>

      </section>


      {/* Features Section */}
      <section className="features">

        <h2>System Features</h2>

        <p className="features-subtitle">
          Powerful tools designed to simplify lecture hall management.
        </p>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Smart Timetable</h3>
            <p>
              Automatically organize lecture schedules and avoid timetable conflicts.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏫</div>
            <h3>Hall Allocation</h3>
            <p>
              Efficiently assign lecture halls based on capacity and availability.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Attendance Tracking</h3>
            <p>
              Track student attendance easily and maintain accurate records.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications</h3>
            <p>
              Receive real-time updates for lecture changes and announcements.
            </p>
          </div>

        </div>

      </section>


      {/* Overview Section */}
      <section className="overview-section">

        <div className="container-wide">

          <div className="overview-content">

            <div className="overview-image">

              <div className="mockup-window">

                <div className="mockup-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>

                <div className="mockup-body">
                  <div className="skeleton-line long"></div>

                  <div className="skeleton-grid">
                    <div className="skeleton-rect"></div>
                    <div className="skeleton-rect"></div>
                  </div>
                </div>

              </div>

            </div>


            <div className="overview-text">

              <span className="badge">System Overview</span>

              <h2>Centralized Control for Faculty Operations</h2>

              <p>
                Our Lecture Hall Management System bridges the gap between administrative 
                planning and technical maintenance. By integrating the TO Portal with 
                Hall Scheduling, we ensure that every lecture happens in a fully 
                functional environment.
              </p>

              <ul className="stats-list">
                <li><strong>99%</strong> Conflict Reduction</li>
                <li><strong>Real-time</strong> Issue Reporting</li>
                <li><strong>Admin</strong> Dashboard Analytics</li>
              </ul>

            </div>

          </div>

        </div>

      </section>


      {/* Footer */}
      <footer className="landing-footer">

        <p>EC6060_E22 Software Engineering Group Project</p>

        <div className="footer-links">
          <a href="https://github.com/dilanka-bandara">GitHub Repository</a>
        </div>

      </footer>

    </div>
  );
};

export default LandingPage;