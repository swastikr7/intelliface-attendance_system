import React, { useEffect, useState } from "react";
import EnrollmentFaceCapture from "../components/EnrollmentFaceCapture";
import {
  enrollStudent,
  getEnrolledStudents,
} from "../utils/enrollment";

const Enrollment = () => {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
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

      setName("");
      setRoll("");
      setFaceDescriptor(null);
    } else {
      setMessage(`❌ ${result.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Enrollment</h2>

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

      <EnrollmentFaceCapture
        onDescriptorReady={setFaceDescriptor}
      />

      {faceDescriptor && (
        <p style={{ color: "green" }}>
          ✔ Face captured successfully
        </p>
      )}

      <button
        onClick={handleEnroll}
        style={{ marginTop: "12px" }}
      >
        Enroll Student
      </button>

      {message && <p>{message}</p>}

      <hr />

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
    </div>
  );
};

export default Enrollment;
