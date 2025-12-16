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

  const handleSaveEnrollment = () => {
    if (!name || !roll || !faceDescriptor) {
      setMessage("❌ Name, roll number, and face capture are required.");
      return;
    }

    const result = enrollStudent({
      name,
      roll,
      faceDescriptor,
    });

    if (result.success) {
      setMessage("✅ Student enrolled successfully.");
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
      <h2>Enrollment (Teachers)</h2>
      <p>
        Use this page to enroll students for face recognition. Capture a clear
        frontal photo and save.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* LEFT: CAMERA + FORM */}
        <div>
          <h3>Camera</h3>

          {/* 🔑 REAL FACE CAPTURE */}
          <EnrollmentFaceCapture
            onDescriptorReady={setFaceDescriptor}
          />

          {faceDescriptor && (
            <p style={{ color: "green" }}>
              ✔ Face captured successfully
            </p>
          )}

          <div style={{ marginTop: "12px" }}>
            <input
              type="text"
              placeholder="Student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ display: "block", marginBottom: "10px" }}
            />

            <input
              type="text"
              placeholder="Student ID / Roll number"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              style={{ display: "block", marginBottom: "10px" }}
            />

            <button onClick={handleSaveEnrollment}>
              Save Enrollment
            </button>

            {message && (
              <p style={{ marginTop: "10px" }}>{message}</p>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <h4>Notes</h4>
            <ul>
              <li>Capture frontal face with good lighting</li>
              <li>Ensure only one face is visible</li>
              <li>Descriptors are stored locally (demo)</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: ENROLLED STUDENTS */}
        <div>
          <h3>Enrolled students (demo)</h3>

          {students.length === 0 ? (
            <p>No enrolled descriptors found (local demo).</p>
          ) : (
            <ul>
              {students.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.roll})
                </li>
              ))}
            </ul>
          )}

          <button
            style={{ marginTop: "10px" }}
            onClick={() => window.location.href = "/teacher/dashboard"}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Enrollment;
