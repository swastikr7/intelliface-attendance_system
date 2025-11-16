import React from 'react'


export default function Dashboard(){
return (
<section className="container page">
<h2 className="page-title">Teacher Dashboard</h2>
<div className="grid grid-3">
<div className="card">
<h4>Total Students</h4>
<div className="big">32</div>
</div>
<div className="card">
<h4>Today Present</h4>
<div className="big">29</div>
</div>
<div className="card">
<h4>Avg Engagement</h4>
<div className="big">74%</div>
</div>
</div>


<div className="mt page-charts">
<div className="card">(Charts placeholder — Recharts will be added later)</div>
</div>
</section>
)
}