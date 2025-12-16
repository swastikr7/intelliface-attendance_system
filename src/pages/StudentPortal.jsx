import React, { useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance } from "../utils/attendance";
import "../styles/dashboard.css";

const StudentPortal = () => {
  const student = {
    name: "Demo Student",
    roll: "CS23",
  };

  const [scanOpen, setScanOpen] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifiedRoll, setVerifiedRoll] = useState(null);
  const [attendanceDone, setAttendanceDone] = useState(false);

  const handleVerified = (roll) => {
    setFaceVerified(true);
    setVerifiedRoll(roll);
  };

  const markAttendance = () => {
    if (!faceVerified || !verifiedRoll) return;

    addAttendance({
      name: student.name,
      roll: verifiedRoll,
      subject: "Physics Lab",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "Present",
    });

    setAttendanceDone(true);
    setScanOpen(false);
    setFaceVerified(false);
  };

  return (
    <div className="dashboard">
      <h2>Mark Attendance (Face)</h2>

      {!attendanceDone && (
        <button
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "15px",
          }}
          onClick={() => setScanOpen(true)}
        >
          Start Face Scan
        </button>
      )}

      {scanOpen && (
        <div className="card section">
          <FaceScanner onVerified={handleVerified} />

          {faceVerified && (
            <>
              <div
                style={{
                  marginTop: "10px",
                  color: "#16a34a",
                  fontWeight: "bold",
                }}
              >
                ✅ Face verified
              </div>

              <button
                style={{
                  marginTop: "15px",
                  padding: "12px 28px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={markAttendance}
              >
                Mark Attendance
              </button>
            </>
          )}
        </div>
      )}

      {attendanceDone && (
        <div
          style={{
            marginTop: "20px",
            color: "#16a34a",
            fontWeight: "bold",
          }}
        >
          ✔ Attendance marked successfully
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
