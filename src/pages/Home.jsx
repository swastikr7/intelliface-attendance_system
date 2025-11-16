import React from 'react'
import { Link } from 'react-router-dom'


export default function Home(){
return (
<section className="container hero">
<div className="hero-card">
<div className="hero-left">
<h1 className="title">IntelliFace</h1>
<p className="subtitle">Smart Curriculum and Image-Based Attendance system — demo frontend prototype.</p>


<div className="cta-row">
<Link to="/enroll" className="btn btn-primary">Enroll Student</Link>
<Link to="/classroom" className="btn btn-outline">Start Check-in</Link>
</div>


<div className="features">
<div className="feature">
<strong>Automated attendance</strong>
<p>Face recognition powered check-ins and logs.</p>
</div>
<div className="feature">
<strong>Engagement tracking</strong>
<p>Simple metrics and participation tracking for teachers.</p>
</div>
</div>
</div>


<aside className="hero-right">
<div className="card mini">
<h4>Today’s class</h4>
<p className="muted">CS 101 - Data Structures</p>
<div className="stat-row">
<div className="stat">
<div className="stat-value">29</div>
<div className="stat-label">Present</div>
</div>
<div className="stat">
<div className="stat-value">3</div>
<div className="stat-label">Absent</div>
</div>
</div>
</div>
</aside>
</div>
</section>
)
}