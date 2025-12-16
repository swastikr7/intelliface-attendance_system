import React, { useEffect, useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance, getAttendance } from "../utils/attendance";
import "../styles/dashboard.css";

const StudentDashboard = () => {
  const student = { name: "Demo Student" };

  const [scanStarted, setScanStarted] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setAttendanceMarked(
      getAttendance().some((r) => r.date === today)
    );
  }, []);

  /**
   * FINAL, SAFE attendance handler
   * No analytics recomputation here
   */
  const handleFaceDetected = (success, matchedRoll) => {
    if (!success || !matchedRoll) return;

    // 1️⃣ Stop scanner immediately
    setScanStarted(false);

    // 2️⃣ Save attendance
    addAttendance({
      name: student.name,
      roll: matchedRoll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    // 3️⃣ Hard refresh dashboard state (SAFE & STABLE)
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

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

        {scanStarted && (
          <FaceScanner onFaceDetected={handleFaceDetected} />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
