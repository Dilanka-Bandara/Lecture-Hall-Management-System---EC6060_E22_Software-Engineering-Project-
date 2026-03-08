import React from "react";
import hero from "../assets/people.png";
import "../styles/landingPage.css";

export default function Hero() {
  return (
    <section className="hero">

      <img src={hero} className="hero-bg" alt="hero"/>

      <div className="hero-overlay"></div>

      <div className="hero-content">

        <h1>
          Smart Lecture Hall <br />
          Management System
        </h1>

        <p>
          Efficiently manage lecture halls, schedules,
          attendance and academic operations with ease.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Sign In</button>
        </div>

      </div>

    </section>
  );
}