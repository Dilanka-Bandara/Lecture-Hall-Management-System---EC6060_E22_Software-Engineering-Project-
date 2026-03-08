import React from "react";
import "../styles/landingPage.css";

export default function Navbar(){
  return(

    <nav className="navbar">

      <div className="logo">
        📘 Lectro
      </div>

      <ul className="nav-links">
        <li>Home</li>
        <li>Features</li>
        <li>About</li>
        <li>Contact</li>
      </ul>

      <button className="signin-btn">
        Sign In
      </button>

    </nav>

  )
}