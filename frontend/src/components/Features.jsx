import React from "react";
import "../styles/landingPage.css";

export default function Features(){

return(

<section className="features">

<h2>Features</h2>

<div className="feature-grid">

<div className="card">
<h3>📅 Smart Timetable Management</h3>
<p>Automate lecture schedules seamlessly.</p>
</div>

<div className="card">
<h3>🏫 Lecture Hall Allocation</h3>
<p>Optimize lecture hall bookings.</p>
</div>

<div className="card">
<h3>📋 Attendance Tracking</h3>
<p>Track and manage student attendance.</p>
</div>

<div className="card">
<h3>🔔 Real-Time Notifications</h3>
<p>Instant alerts for schedule updates.</p>
</div>

</div>

</section>

)
}