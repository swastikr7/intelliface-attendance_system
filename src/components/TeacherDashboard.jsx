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

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [faceImage, setFaceImage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAttendance(getAttendance());
    setStudents(getEnrolledStudents());
  }, []);

  const handleEnroll = () => {
    if (!name || !roll || !faceImage) {
      setMessage("All fields and face capture required");
      return;
    }

    const result = enrollStudent({
      name,
      roll,
      faceImage,
    });

    if (result.success) {
      setMessage("✅ Student enrolled successfully");
      setStudents(getEnrolledStudents());
      setName("");
      setRoll("");
      setFaceImage("");
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teacher Dashboard</h2>

      {/* ENROLLMENT SECTION */}
      <h3>Enroll Student</h3>

      <input
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <input
        placeholder="Roll Number"
        value={roll}
        onChange={(e) => setRoll(e.target.value)}
        style={{ marginTop: "5px" }}
      />

      <EnrollmentFaceCapture onCapture={setFaceImage} />

      <button onClick={handleEnroll} style={{ marginTop: "10px" }}>
        Enroll Student
      </button>

      {message && <p>{message}</p>}

      <hr />

      {/* ENROLLED STUDENTS */}
      <h3>Enrolled Students</h3>
      {students.length === 0 ? (
        <p>No students enrolled.</p>
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

      {/* ATTENDANCE */}
      <h3>Attendance Records</h3>
      {attendance.length === 0 ? (
        <p>No attendance records.</p>
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
