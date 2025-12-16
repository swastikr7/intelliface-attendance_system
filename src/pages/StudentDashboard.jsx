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
import { getWeeklyGoal } from "../utils/goals";
import "../styles/dashboard.css";

const StudentDashboard = () => {
  const student = { name: "Demo Student", roll: "CS23" };

  const [scanStarted, setScanStarted] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  // Gamification
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState("");
  const [badges, setBadges] = useState([]);

  // Analytics
  const [overall, setOverall] = useState({ present: 0, total: 0, percentage: 0 });
  const [subjects, setSubjects] = useState({});
  const [insights, setInsights] = useState([]);

  // Weekly goal
  const [weeklyGoal, setWeeklyGoal] = useState({
    target: 5,
    completed: 0,
    remaining: 0,
    percentage: 0,
  });

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

    setWeeklyGoal(getWeeklyGoal(5));
  };

  const checkTodayAttendance = () => {
    const today = new Date().toLocaleDateString();
    setAttendanceMarked(
      getAttendance().some(
        (r) => r.date === today && r.roll === student.roll
      )
    );
  };

  const handleFaceDetected = (success) => {
    if (!success) return;

    addAttendance({
      name: student.name,
      roll: student.roll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    setAttendanceMarked(true);
    setScanStarted(false);
    refreshAll();
  };

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      {/* TOP STATS */}
      <div className="grid-3 section">
        <div className="card">
          <h4>🎯 Score</h4>
          <div className="stat">{score}/100</div>
        </div>
        <div className="card">
          <h4>🔥 Streak</h4>
          <div className="stat">{streak} Days</div>
        </div>
        <div className="card">
          <h4>⭐ Level</h4>
          <div className="stat">{level}</div>
        </div>
      </div>

      {/* WEEKLY GOAL */}
      <div className="card section">
        <h4>🎯 Weekly Attendance Goal</h4>
        <p>
          {weeklyGoal.completed} / {weeklyGoal.target} classes attended
        </p>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${weeklyGoal.percentage}%`,
              background: weeklyGoal.percentage >= 100 ? "#4caf50" : "#2196f3",
            }}
          >
            {weeklyGoal.percentage}%
          </div>
        </div>
        <p style={{ marginTop: "8px" }}>
          {weeklyGoal.remaining === 0
            ? "🎉 Weekly goal achieved! Great consistency."
            : `🚀 Attend ${weeklyGoal.remaining} more classes to reach your goal.`}
        </p>
      </div>

      {/* OVERALL ATTENDANCE */}
      <div className="card section">
        <h4>📊 Overall Attendance</h4>
        <p>{overall.present} / {overall.total} classes attended</p>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{
              width: `${overall.percentage}%`,
              background: overall.percentage >= 75 ? "#4caf50" : "#f44336",
            }}
          >
            {overall.percentage}%
          </div>
        </div>
      </div>

      {/* SUBJECTS + BADGES */}
      <div className="grid-2 section">
        <div className="card">
          <h4>📚 Subject-wise Attendance</h4>
          {Object.keys(subjects).map((s) => (
            <div key={s} className="subject">
              <span>{s}</span>
              <span className={subjects[s].status.toLowerCase()}>
                {subjects[s].percentage}% ({subjects[s].status})
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <h4>🏅 Achievements</h4>
          <ul className="badges">
            {badges.length
              ? badges.map((b, i) => <li key={i}>{b}</li>)
              : <li>No badges yet</li>}
          </ul>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="card section">
        <h4>💡 Smart Insights</h4>
        <ul className="insights">
          {insights.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </div>

      {/* ATTENDANCE ACTION */}
      <div className="card section">
        {!attendanceMarked ? (
          <button
            className="attendance-btn"
            onClick={() => setScanStarted(true)}
          >
            Mark Attendance
          </button>
        ) : (
          <p className="safe">✔ Attendance marked for today</p>
        )}

        {scanStarted && <FaceScanner onFaceDetected={handleFaceDetected} />}
      </div>
    </div>
  );
};

export default StudentDashboard;
