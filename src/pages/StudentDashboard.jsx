import React, { useEffect, useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance, getAttendance } from "../utils/attendance";
import {
  calculateAttendanceScore,
  calculateStreak,
  getEngagementLevel,
  getBadges,
} from "../utils/gamification";
import {
  getOverallAttendance,
  getSubjectWiseAttendance,
  getAttendanceInsights,
} from "../utils/analytics";

const StudentDashboard = () => {
  const student = { name: "Demo Student", roll: "CS23" };

  const [scanStarted, setScanStarted] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [message, setMessage] = useState("");

  // Gamification
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState("");
  const [badges, setBadges] = useState([]);

  // Analytics
  const [overall, setOverall] = useState({ present: 0, total: 0, percentage: 0 });
  const [subjects, setSubjects] = useState({});
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    refreshAll();
    checkTodayAttendance();
  }, []);

  const refreshAll = () => {
    const s = calculateAttendanceScore();
    const st = calculateStreak();

    setScore(s);
    setStreak(st);
    setLevel(getEngagementLevel(s));
    setBadges(getBadges(s, st));

    setOverall(getOverallAttendance());
    setSubjects(getSubjectWiseAttendance());
    setInsights(getAttendanceInsights());
  };

  const checkTodayAttendance = () => {
    const today = new Date().toLocaleDateString();
    const records = getAttendance();
    setAttendanceMarked(
      records.some((r) => r.date === today && r.roll === student.roll)
    );
  };

  const handleFaceDetected = (success) => {
    if (!success) {
      setMessage("❌ Face not detected. Try again.");
      setScanStarted(false);
      return;
    }

    addAttendance({
      name: student.name,
      roll: student.roll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    setMessage("✅ Attendance marked successfully!");
    setAttendanceMarked(true);
    setScanStarted(false);
    refreshAll();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>

      {/* GAMIFICATION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "15px" }}>
        <div className="card"><h4>🎯 Score</h4><h2>{score}/100</h2></div>
        <div className="card"><h4>🔥 Streak</h4><h2>{streak} Days</h2></div>
        <div className="card"><h4>⭐ Level</h4><h2>{level}</h2></div>
      </div>

      {/* BADGES */}
      <div className="card" style={{ marginTop: "15px" }}>
        <h4>🏅 Achievements</h4>
        {badges.length ? <ul>{badges.map((b, i) => <li key={i}>{b}</li>)}</ul> : <p>No badges yet</p>}
      </div>

      {/* OVERALL ATTENDANCE */}
      <div className="card" style={{ marginTop: "15px" }}>
        <h4>📊 Overall Attendance</h4>
        <p>{overall.present} / {overall.total} classes attended</p>
        <div style={{ background: "#ddd", borderRadius: "10px", overflow: "hidden" }}>
          <div
            style={{
              width: `${overall.percentage}%`,
              background: overall.percentage >= 75 ? "#28a745" : "#dc3545",
              color: "white",
              padding: "5px",
              textAlign: "center",
            }}
          >
            {overall.percentage}%
          </div>
        </div>
      </div>

      {/* SUBJECT-WISE */}
      <div className="card" style={{ marginTop: "15px" }}>
        <h4>📚 Subject-wise Attendance</h4>
        {Object.keys(subjects).map((sub) => (
          <p key={sub}>
            <b>{sub}</b>: {subjects[sub].percentage}% —
            <span style={{
              color:
                subjects[sub].status === "Safe"
                  ? "green"
                  : subjects[sub].status === "Warning"
                  ? "orange"
                  : "red",
            }}>
              {" "}{subjects[sub].status}
            </span>
          </p>
        ))}
      </div>

      {/* INSIGHTS */}
      <div className="card" style={{ marginTop: "15px" }}>
        <h4>💡 Smart Insights</h4>
        <ul>
          {insights.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </div>

      {/* ATTENDANCE ACTION */}
      <div className="card" style={{ marginTop: "15px" }}>
        {!attendanceMarked && (
          <button onClick={() => setScanStarted(true)}>Mark Attendance</button>
        )}
        {scanStarted && <FaceScanner onFaceDetected={handleFaceDetected} />}
        {attendanceMarked && <p style={{ color: "green" }}>Attendance marked for today.</p>}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default StudentDashboard;
