import React, { useEffect, useState } from "react";
import { getAttendance } from "../utils/attendance";
import {
  getEnrolledStudents,
  enrollStudent,
} from "../utils/enrollment";
import EnrollmentFaceCapture from "../components/EnrollmentFaceCapture";

const TeacherDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);

  // Enrollment form state
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAttendance(getAttendance());
    setStudents(getEnrolledStudents());
  }, []);

  const handleEnroll = () => {
    if (!name || !roll || !faceDescriptor) {
      setMessage("❌ Name, roll number, and face capture are required");
      return;
    }

    const result = enrollStudent({
      name,
      roll,
      faceDescriptor,
    });

    if (result.success) {
      setMessage("✅ Student enrolled successfully");
      setStudents(getEnrolledStudents());

      // Reset form
      setName("");
      setRoll("");
      setFaceDescriptor(null);
    } else {
      setMessage(`❌ ${result.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teacher Dashboard</h2>

      {/* ENROLLMENT SECTION */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Enroll Student (Face Registration)</h3>

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Roll Number"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}
        />

        {/* Face descriptor capture */}
        <EnrollmentFaceCapture
          onDescriptorReady={setFaceDescriptor}
        />

        {faceDescriptor && (
          <p style={{ color: "green", marginTop: "8px" }}>
            ✔ Face captured successfully
          </p>
        )}

        <button
          onClick={handleEnroll}
          style={{ marginTop: "12px" }}
        >
          Enroll Student
        </button>

        {message && (
          <p style={{ marginTop: "10px" }}>{message}</p>
        )}
      </div>

      <hr />

      {/* ENROLLED STUDENTS */}
      <h3>Enrolled Students</h3>
      {students.length === 0 ? (
        <p>No students enrolled yet.</p>
      ) : (
        <ul>
          {students.map((s) => (
            <li key={s.id}>
              {s.name} ({s.roll})
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* ATTENDANCE RECORDS */}
      <h3>Attendance Records</h3>
      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.roll}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherDashboard;
