import React, { useState } from "react";
import FaceScanner from "../components/FaceScanner";
import { addAttendance } from "../utils/attendance";

const StudentDashboard = () => {
  const [scanStarted, setScanStarted] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [message, setMessage] = useState("");

  // Demo student data (can be replaced later)
  const student = {
    name: "Demo Student",
    roll: "CS23",
  };

  const handleFaceDetected = (success) => {
    if (!success) {
      setMessage("Face not detected. Please try again.");
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

    const saved = addAttendance(record);

    if (saved) {
      setAttendanceMarked(true);
      setMessage("✅ Attendance marked successfully!");
    } else {
      setMessage("❌ Failed to mark attendance.");
    }

    setScanStarted(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>
      <p>
        Name: <b>{student.name}</b>
      </p>
      <p>
        Roll No: <b>{student.roll}</b>
      </p>

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
        <p style={{ marginTop: "10px" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default StudentDashboard;
