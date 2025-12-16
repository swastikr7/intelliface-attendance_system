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

  const handleFaceDetected = (success, matchedRoll) => {
    if (!success || !matchedRoll) return;

    // 🔑 UNMOUNT FIRST
    setScanStarted(false);

    addAttendance({
      name: student.name,
      roll: matchedRoll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    setAttendanceMarked(true);
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
