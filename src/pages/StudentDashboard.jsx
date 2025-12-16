import React, { useEffect, useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance, getAttendance } from "../utils/attendance";
import "../styles/dashboard.css";

const StudentDashboard = () => {
  const student = { name: "Demo Student" };

  const [scanStarted, setScanStarted] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifiedRoll, setVerifiedRoll] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    setAttendanceMarked(
      getAttendance().some((r) => r.date === today)
    );
  }, []);

  const handleVerified = (roll) => {
    setFaceVerified(true);
    setVerifiedRoll(roll);
  };

  const markAttendance = () => {
    if (!faceVerified || !verifiedRoll) return;

    addAttendance({
      name: student.name,
      roll: verifiedRoll,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    setAttendanceMarked(true);
    setScanStarted(false);
    setFaceVerified(false);
  };

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      <div className="card section">
        {!attendanceMarked ? (
          <>
            {!scanStarted && (
              <button
                className="attendance-btn"
                onClick={() => setScanStarted(true)}
              >
                Scan Face
              </button>
            )}

            {scanStarted && (
              <FaceScanner onVerified={handleVerified} />
            )}

            {faceVerified && (
              <button
                className="attendance-btn"
                style={{ marginTop: 10 }}
                onClick={markAttendance}
              >
                Mark Attendance
              </button>
            )}
          </>
        ) : (
          <p className="safe">✔ Attendance marked for today</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
