// src/components/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { loadLabeledDescriptors, saveLabeledDescriptorsToLocalStorage, loadAttendanceRecords } from "../utils/faceUtils";

const TEACHER_PASSCODE = "teacher123"; // same demo passcode

export default function TeacherDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authorized) {
      reloadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  function authorize() {
    const p = prompt("Enter teacher passcode:");
    if (p === TEACHER_PASSCODE) {
      setAuthorized(true);
      setMessage("Authorized");
    } else {
      setMessage("Incorrect passcode");
    }
  }

  async function reloadData() {
    const s = await loadLabeledDescriptors({ localStorageKey: "descriptors" });
    const a = await loadAttendanceRecords();
    setStudents(s || []);
    setAttendance(a || []);
  }

  function removeStudent(id) {
    if (!confirm("Delete student and all descriptors?")) return;
    const remaining = students.filter((s) => s.studentId !== id);
    saveLabeledDescriptorsToLocalStorage(remaining, { localStorageKey: "descriptors" });
    setStudents(remaining);
    setMessage("Student deleted.");
  }

  function renameStudent(id) {
    const current = students.find((s) => s.studentId === id);
    if (!current) return;
    const newName = prompt("New name:", current.name);
    if (!newName) return;
    const updated = students.map((s) => (s.studentId === id ? { ...s, name: newName } : s));
    saveLabeledDescriptorsToLocalStorage(updated, { localStorageKey: "descriptors" });
    setStudents(updated);
    setMessage("Name updated.");
  }

  if (!authorized) {
    return (
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">Teacher Dashboard</h3>
        <button onClick={authorize} className="px-3 py-1 rounded bg-yellow-600 text-white">Enter Teacher Passcode</button>
        <div className="mt-2 text-sm text-gray-600">{message}</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-2">Teacher Dashboard</h3>

      <div className="mb-4">
        <strong>Enrolled Students</strong>
        <div className="mt-2 space-y-2">
          {students.length === 0 && <div className="text-sm text-gray-500">No students enrolled yet.</div>}
          {students.map((s) => (
            <div key={s.studentId} className="p-2 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.studentId} — {s.descriptors ? s.descriptors.length : 0} descriptors</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => renameStudent(s.studentId)} className="px-2 py-1 rounded bg-blue-600 text-white text-sm">Edit</button>
                <button onClick={() => removeStudent(s.studentId)} className="px-2 py-1 rounded bg-red-600 text-white text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <strong>Attendance Log (recent)</strong>
        <div className="mt-2 space-y-2">
          {attendance.length === 0 && <div className="text-sm text-gray-500">No attendance recorded yet.</div>}
          {attendance.slice(0, 50).map((a, idx) => (
            <div key={idx} className="p-2 bg-white rounded shadow flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-gray-500">{new Date(a.timestampISO).toLocaleString()}</div>
              </div>
              <div className="text-xs text-gray-500">dist: {a.distance ? a.distance.toFixed(3) : "-"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">{message}</div>
    </div>
  );
}

/* Note: imports for loadAttendanceRecords and export are used at top of this file.
   If your bundler complains about unused imports, ensure you add:
   import { loadAttendanceRecords } from "../utils/faceUtils";
   (already included earlier in file if needed)
*/
