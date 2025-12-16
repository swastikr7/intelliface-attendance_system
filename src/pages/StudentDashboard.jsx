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
    setVerifiedRoll(null);
  };

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      <div
        className="card section"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {!attendanceMarked && !scanStarted && (
          <button
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setScanStarted(true)}
          >
            Scan Face
          </button>
        )}

        {scanStarted && (
          <>
            <FaceScanner onVerified={handleVerified} />

            {faceVerified && (
              <>
                <div
                  style={{
                    color: "#16a34a",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  ✅ Face verified successfully
                </div>

                <button
                  style={{
                    padding: "12px 28px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={markAttendance}
                >
                  Mark Attendance
                </button>
              </>
            )}
          </>
        )}

        {attendanceMarked && (
          <div
            style={{
              color: "#16a34a",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            ✔ Attendance marked for today
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
