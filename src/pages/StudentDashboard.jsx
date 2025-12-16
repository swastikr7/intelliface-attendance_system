import React, { useEffect, useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance, getAttendance } from "../utils/attendance";
import {
  calculateAttendanceScore,
  calculateStreak,
  getEngagementLevel,
  getBadges,
} from "../utils/gamification";

const StudentDashboard = () => {
  const [scanStarted, setScanStarted] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [message, setMessage] = useState("");

  // Gamification states
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState("");
  const [badges, setBadges] = useState([]);

  // Demo student data
  const student = {
    name: "Demo Student",
    roll: "CS23",
  };

  useEffect(() => {
    refreshGamification();
    checkTodayAttendance();
  }, []);

  const refreshGamification = () => {
    const s = calculateAttendanceScore();
    const st = calculateStreak();
    setScore(s);
    setStreak(st);
    setLevel(getEngagementLevel(s));
    setBadges(getBadges(s, st));
  };

  const checkTodayAttendance = () => {
    const today = new Date().toLocaleDateString();
    const records = getAttendance();
    const marked = records.some(
      (r) => r.date === today && r.roll === student.roll
    );
    setAttendanceMarked(marked);
  };

  const handleFaceDetected = (success) => {
    if (!success) {
      setMessage("❌ Face not detected. Try again.");
      setScanStarted(false);
      return;
    }

    const record = {
      name: student.name,
      roll: student.roll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    };

    addAttendance(record);
    setMessage("✅ Attendance marked successfully!");
    setAttendanceMarked(true);
    setScanStarted(false);
    refreshGamification();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>

      {/* GAMIFICATION PANEL */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div className="card">
          <h4>🎯 Attendance Score</h4>
          <h2>{score} / 100</h2>
        </div>

        <div className="card">
          <h4>🔥 Attendance Streak</h4>
          <h2>{streak} Days</h2>
        </div>

        <div className="card">
          <h4>⭐ Engagement Level</h4>
          <h2>{level}</h2>
        </div>
      </div>

      {/* BADGES */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h4>🏅 Achievements</h4>
        {badges.length === 0 ? (
          <p>No badges earned yet</p>
        ) : (
          <ul>
            {badges.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* STUDENT INFO */}
      <div className="card">
        <p>
          Name: <b>{student.name}</b>
        </p>
        <p>
          Roll No: <b>{student.roll}</b>
        </p>
      </div>

      {/* ATTENDANCE ACTION */}
      <div className="card" style={{ marginTop: "15px" }}>
        {!attendanceMarked && (
          <button onClick={() => setScanStarted(true)}>
            Mark Attendance
          </button>
        )}

        {scanStarted && (
          <FaceScanner onFaceDetected={handleFaceDetected} />
        )}

        {attendanceMarked && (
          <p style={{ color: "green", marginTop: "10px" }}>
            Attendance already marked for today.
          </p>
        )}

        {message && (
          <p style={{ marginTop: "10px" }}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
