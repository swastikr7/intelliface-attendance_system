import React from 'react'
import WebcamCapture from '../widgets/WebcamCapture'


export default function Classroom(){
return (
<section className="container page">
<h2 className="page-title">Classroom - Check-in</h2>
<div className="card">
<p className="muted">Students can check in using webcam. Teacher can start a session to accept check-ins.</p>
<WebcamCapture />
</div>
</section>
)
}