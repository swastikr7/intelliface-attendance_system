// src/pages/StudentPortal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FaceScanner from "../components/FaceScanner";

/* ---------- helpers ---------- */
function isoDateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function timeDisplay(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/* ---------- demo data ---------- */
function seedDemoLectures() {
  const existing = JSON.parse(localStorage.getItem("lectures") || "null") || [];
  if (existing.length) return existing;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const base = `${yyyy}-${mm}-${dd}`;

  const demo = [
    { id: "lec-1", title: "Computer Science", startISO: `${base}T09:00:00`, endISO: `${base}T10:00:00`, room: "Room 301", subjectCode: "CS301" },
    { id: "lec-2", title: "Mathematics", startISO: `${base}T10:15:00`, endISO: `${base}T11:15:00`, room: "Room 205", subjectCode: "MA201" },
    { id: "lec-3", title: "Physics Lab", startISO: `${base}T13:00:00`, endISO: `${base}T15:00:00`, room: "Lab 102", subjectCode: "PH101" },
    { id: "lec-4", title: "English", startISO: `${base}T15:15:00`, endISO: `${base}T16:00:00`, room: "Room 108", subjectCode: "EN101" },
  ];
  localStorage.setItem("lectures", JSON.stringify(demo));
  return demo;
}

function findRelevantLectureForNow(lectures) {
  if (!lectures.length) return null;
  const now = new Date();
  for (const l of lectures) {
    const s = new Date(l.startISO);
    const e = new Date(l.endISO);
    if (now >= s && now <= e) return l;
  }
  return lectures[0];
}

/* ================== COMPONENT ================== */

export default function StudentPortal() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const role = String(auth?.user?.role || "").toLowerCase();
    if (auth?.user && role !== "student") {
      navigate("/dashboard", { replace: true });
    }
  }, [auth, navigate]);

  const student = auth?.user || { name: "Demo Student", email: "student@demo.com", id: "demo-student" };

  const [lectures, setLectures] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);

  // 🔑 NEW STATE (minimal)
  const [faceEvent, setFaceEvent] = useState(null); // stores face match result

  const [selectedLectureId, setSelectedLectureId] = useState("auto");

  useEffect(() => {
    setLectures(seedDemoLectures());
    setAttendance(JSON.parse(localStorage.getItem("attendanceRecords") || "[]"));
  }, []);

  const todayISO = isoDateOnly(new Date());
  const todays = useMemo(() => lectures.filter((l) => isoDateOnly(l.startISO) === todayISO), [lectures]);

  function saveAttendanceRecord(rec) {
    const next = attendance.filter((r) => !(r.lectureId === rec.lectureId && r.studentId === rec.studentId));
    next.push(rec);
    localStorage.setItem("attendanceRecords", JSON.stringify(next));
    setAttendance(next);
  }

  function pickLectureForMarking() {
    if (selectedLectureId !== "auto") {
      return lectures.find((l) => l.id === selectedLectureId) || null;
    }
    return findRelevantLectureForNow(todays.length ? todays : lectures);
  }

  /* ---------- FINAL MARK ---------- */
  function confirmMarkAttendance() {
    if (!faceEvent) return;

    const relevant = pickLectureForMarking();
    if (!relevant) return;

    const rec = {
      lectureId: relevant.id,
      studentId: student.id || student.email,
      status: "present",
      time: new Date().toISOString(),
      confidence: faceEvent.confidence,
      snapshot: faceEvent.snapshot,
    };

    saveAttendanceRecord(rec);
    setLastSnapshot(faceEvent.snapshot || null);
    setMessage(`Marked present for ${relevant.title}`);
    setFaceEvent(null);
    setScannerOpen(false);
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Student Portal</div>
        <div style={{ fontSize: 14 }}>{student.name}</div>
      </div>

      <div style={gridStyle}>
        {/* ---------- MARK ATTENDANCE CARD ---------- */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Mark Attendance (Face)</div>

          <select
            value={selectedLectureId}
            onChange={(e) => setSelectedLectureId(e.target.value)}
            style={{ padding: 8, borderRadius: 8, width: "100%", marginBottom: 10 }}
          >
            <option value="auto">Auto (nearest)</option>
            {todays.map((l) => (
              <option key={l.id} value={l.id}>
                {timeDisplay(l.startISO)} • {l.title}
              </option>
            ))}
          </select>

          <button onClick={() => setScannerOpen((s) => !s)} style={actionBtn}>
            {scannerOpen ? "Close Face Scanner" : "Start Face Scan"}
          </button>

          <div style={{ marginTop: 8, fontSize: 13 }}>{message || "Ready"}</div>

          {scannerOpen && (
            <div style={{ marginTop: 12 }}>
              <FaceScanner
                autoStart
                onMarkAttendance={(evt) => {
                  // 🔑 ONLY STORE RESULT — DO NOT MARK
                  setFaceEvent(evt);
                }}
              />

              {faceEvent && (
                <>
                  <div style={{ marginTop: 10, color: "#16a34a", fontWeight: 700 }}>
                    ✅ Face verified
                  </div>

                  <button
                    onClick={confirmMarkAttendance}
                    style={{ ...actionBtn, marginTop: 10, background: "#16a34a" }}
                  >
                    Mark Attendance
                  </button>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
function Card({ children }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      padding: 16,
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.03)",
      color: "#e6eef8",
    }}>
      {children}
    </div>
  );
}

const pageStyle = { padding: 18, maxWidth: 1200, margin: "6px auto" };
const headerStyle = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 };
const actionBtn = { padding: "10px 12px", borderRadius: 8, background: "#06b6d4", border: "none", cursor: "pointer" };
