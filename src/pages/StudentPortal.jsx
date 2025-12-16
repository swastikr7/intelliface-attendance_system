// src/pages/StudentPortal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FaceScanner from "../components/FaceScanner";

/**
 * StudentPortal.jsx (Face-based attendance) — with lecture selector
 *
 * - Adds a lecture selector above the FaceScanner so student/teacher can pick which lecture to mark.
 * - If "Auto (nearest)" is selected, the system picks the current/nearest lecture automatically.
 * - When FaceScanner returns a match via onMarkAttendance, the selected lecture (or auto) is used to create the attendance record.
 *
 * Note: This file contains a self-redirect that sends non-students to /dashboard
 * so teachers cannot view the student portal even if they open the route directly.
 */

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

// seeds demo lectures if none present
function seedDemoLectures() {
  const existing = JSON.parse(localStorage.getItem("lectures") || "null") || [];
  if (existing && existing.length > 0) return existing;

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

// find the "current" lecture (time window) or nearest upcoming/past for now
function findRelevantLectureForNow(lectures) {
  if (!lectures || lectures.length === 0) return null;
  const now = new Date();
  // first look for lecture where now between start and end
  for (const l of lectures) {
    const s = new Date(l.startISO);
    const e = new Date(l.endISO);
    if (now >= s && now <= e) return l;
  }
  // next: nearest by absolute time difference to start
  let best = lectures[0];
  let bestDiff = Math.abs(new Date(best.startISO) - now);
  for (const l of lectures) {
    const d = Math.abs(new Date(l.startISO) - now);
    if (d < bestDiff) {
      best = l;
      bestDiff = d;
    }
  }
  return best;
}

export default function StudentPortal() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Self-redirect: if the logged-in user exists and is NOT a 'student', send them to /dashboard
  useEffect(() => {
    const role = String(auth?.user?.role || "").toLowerCase();
    if (auth?.user && role !== "student") {
      // Replace history so back button doesn't immediately return them here
      navigate("/dashboard", { replace: true });
    }
    // If user not logged in yet, do not redirect here; ProtectedRoute should handle auth.
  }, [auth, navigate]);

  const student = auth?.user || { name: "Demo Student", email: "student@demo.com", id: "demo-student" };

  // state
  const [lectures, setLectures] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [lastMarkedLectureId, setLastMarkedLectureId] = useState(null);

  // Lecture selector state: "auto" or lectureId
  const [selectedLectureId, setSelectedLectureId] = useState("auto");

  // load / seed data on mount
  useEffect(() => {
    const lects = seedDemoLectures();
    setLectures(lects);

    const recs = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    setAttendance(recs);

    // default selection: auto
    setSelectedLectureId("auto");
  }, []);

  // today's lectures
  const todayISO = isoDateOnly(new Date());
  const todays = useMemo(() => lectures.filter((l) => isoDateOnly(l.startISO) === todayISO), [lectures]);

  function findRecord(lectureId) {
    return (attendance || []).find((r) => r.lectureId === lectureId && (r.studentId === (student.id || student.email)));
  }

  function saveAttendanceRecord(rec) {
    // dedupe by lectureId + studentId
    const next = (attendance || []).filter((r) => !(r.lectureId === rec.lectureId && r.studentId === rec.studentId));
    next.push(rec);
    localStorage.setItem("attendanceRecords", JSON.stringify(next));
    setAttendance(next);
    setLastMarkedLectureId(rec.lectureId);
  }

  // choose lecture to use for marking based on selector
  function pickLectureForMarking() {
    if (selectedLectureId && selectedLectureId !== "auto") {
      return lectures.find((l) => l.id === selectedLectureId) || null;
    }
    // auto behaviour: pick relevant from today's list if available, else all lectures
    const source = todays.length ? todays : lectures;
    return findRelevantLectureForNow(source);
  }

  // called by FaceScanner when a confident match occurs
  async function handleFaceMark({ studentId: matchedStudentId, name, confidence, snapshot }) {
    const relevant = pickLectureForMarking();
    if (!relevant) {
      setMessage("No lecture selected or found for marking attendance.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    // For demo, prefer logged-in student id
    const uid = student.id || student.email;
    const matchedId = matchedStudentId || uid;

    // If matched student differs from logged-in user, you might want to show a warning.
    // For demo we still use logged-in student's id so they mark themselves.
    const rec = {
      lectureId: relevant.id,
      studentId: uid,
      status: "present",
      time: new Date().toISOString(),
      confidence: typeof confidence === "number" ? confidence : undefined,
      snapshot,
    };

    saveAttendanceRecord(rec);
    setLastSnapshot(snapshot || null);
    setMessage(`Marked present for ${relevant.title}`);
    // close scanner shortly after mark for UX
    setTimeout(() => setScannerOpen(false), 800);
    setTimeout(() => setMessage(""), 4000);
  }

  // manual mark (fallback)
  function markPresentManual(lectureId) {
    const rec = {
      lectureId,
      studentId: student.id || student.email,
      status: "present",
      time: new Date().toISOString(),
    };
    saveAttendanceRecord(rec);
    setMessage("Marked present (manual).");
    setTimeout(() => setMessage(""), 2500);
  }

  // UI metrics
  const totalLectures = todays.length;
  const presentCount = todays.filter((l) => findRecord(l.id)?.status === "present").length;
  const absentCount = todays.filter((l) => findRecord(l.id)?.status === "absent").length;
  const notMarked = totalLectures - presentCount - absentCount;

  // helper: render a dropdown of options
  function LectureSelector() {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: "#94a3b8", marginRight: 8 }}>Lecture:</label>
        <select
          value={selectedLectureId}
          onChange={(e) => setSelectedLectureId(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, background: "#0b1220", color: "#e6eef8", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          <option value="auto">Auto (nearest / ongoing)</option>
          {todays.length === 0 && <option disabled>-- No lectures today --</option>}
          {todays.map((l) => (
            <option key={l.id} value={l.id}>
              {`${timeDisplay(l.startISO)} • ${l.title}`}
            </option>
          ))}
          {/* also include non-today lectures for manual selection (optional) */}
          {lectures
            .filter((l) => isoDateOnly(l.startISO) !== todayISO)
            .map((l) => (
              <option key={l.id} value={l.id}>
                {`${isoDateOnly(l.startISO)} ${timeDisplay(l.startISO)} • ${l.title}`}
              </option>
            ))}
        </select>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Student Portal</div>
        <div style={{ fontSize: 14 }}>{student.name}</div>
      </div>

      <div style={gridStyle}>
        {/* Profile Card */}
        <Card>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={avatarStyle}>{student.name ? student.name.charAt(0).toUpperCase() : "S"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{student.name}</div>
              <div style={{ color: "#98a2b3", fontSize: 13 }}>{student.email}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Badge label="B.Tech Computer" />
                <Badge label="Section A" />
                <Badge label="5th Semester" />
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Attendance</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#16a34a" }}>{Math.round(Math.random() * 10) + 80}%</div>
            </div>
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 800 }}>Today's Schedule</div>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>{new Date().toLocaleDateString()}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todays.length === 0 && <div style={{ color: "#94a3b8" }}>No lectures today.</div>}
            {todays.map((l) => {
              const rec = findRecord(l.id);
              const status = rec ? (rec.status === "present" ? "Present" : "Absent") : "Not marked";
              return (
                <div key={l.id} style={lectureRowStyle}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{timeDisplay(l.startISO)} • {l.room}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 6, fontWeight: 700, color: status === "Present" ? "#16a34a" : status === "Absent" ? "#ef4444" : "#f59e0b" }}>
                      {status}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {!rec && <button onClick={() => markPresentManual(l.id)} style={smallBtn}>Mark Present</button>}
                      <button onClick={() => {
                        setSelectedLectureId(l.id);
                        setMessage("");
                      }} style={{ ...smallBtn, marginLeft: 8, background: "#374151" }}>Select</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mark Attendance (Face) */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Mark Attendance (Face)</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
            Choose the lecture you want to mark, then start face scan.
          </div>

          {/* Lecture selector */}
          <LectureSelector />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setScannerOpen((s) => !s)} style={actionBtn}>
              {scannerOpen ? "Close Face Scanner" : "Start Face Scan"}
            </button>

            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{message || "Ready"}</div>
              {lastSnapshot && (
                <img src={lastSnapshot} alt="last-snap" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 6, marginTop: 8 }} />
              )}
            </div>
          </div>

          {scannerOpen && (
            <div style={{ marginTop: 12 }}>
              <FaceScanner
                autoStart={true}
                onMarkAttendance={async (evt) => {
                  await handleFaceMark(evt);
                }}
              />
            </div>
          )}
        </Card>

        {/* Productivity Tracker */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Productivity Tracker</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>10</div>
            <div>
              <div style={{ fontWeight: 700 }}>Beginner</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>35 min focus • 4 breaks</div>
            </div>
          </div>
          <div style={{ height: 8, background: "#0b1220", borderRadius: 6, marginTop: 12 }}>
            <div style={{ width: `40%`, height: 8, background: "#06b6d4", borderRadius: 6 }} />
          </div>
        </Card>

        {/* Recommended Activities */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Recommended Activities</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={recommendRow}><div style={{ fontWeight: 700 }}>Practice Python Problems</div><div style={{ ...smallBtn, background: "#06b6d4" }}>Start</div></div>
            <div style={recommendRow}><div style={{ fontWeight: 700 }}>Math Problem Solving</div><div style={{ ...smallBtn, background: "#06b6d4" }}>Start</div></div>
            <div style={recommendRow}><div style={{ fontWeight: 700 }}>Read Research Paper (CS)</div><div style={{ ...smallBtn, background: "#06b6d4" }}>Start</div></div>
          </div>
        </Card>

        {/* Attendance summary */}
        <Card>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Your Attendance</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{presentCount}/{totalLectures}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Present • Lectures today</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, color: "#f59e0b" }}>{notMarked}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Not marked</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Subject-wise</div>
            <div style={{ display: "grid", gap: 8 }}>
              {todays.slice(0, 3).map((l) => {
                const rec = findRecord(l.id);
                const pct = rec && rec.status === "present" ? 90 : 0;
                return (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13 }}>{l.title}</div>
                    <div style={{ width: 120, height: 8, background: "#0b1220", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: 8, background: "#16a34a" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* small footer */}
      <div style={{ marginTop: 18, textAlign: "center", color: "#94a3b8" }}>
        Face-based check-in demo — data stored locally in the browser.
      </div>
    </div>
  );
}

/* -------------------- helpers / styles -------------------- */

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
function Badge({ label }) {
  return <div style={{ background: "rgba(255,255,255,0.03)", padding: "4px 8px", borderRadius: 6, fontSize: 12, color: "#cbd5e1" }}>{label}</div>;
}

const pageStyle = { padding: 18, maxWidth: 1200, margin: "6px auto" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "start" };
const avatarStyle = { width: 64, height: 64, borderRadius: 8, background: "#eef", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 };
const lectureRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 8, background: "rgba(0,0,0,0.12)" };
const smallBtn = { padding: "6px 8px", borderRadius: 6, background: "#06b6d4", border: "none", cursor: "pointer", color: "#001" };
const actionBtn = { padding: "10px 12px", borderRadius: 8, background: "#06b6d4", color: "#001", border: "none", cursor: "pointer" };
const recommendRow = { padding: 10, borderRadius: 8, background: "#071024", display: "flex", justifyContent: "space-between", alignItems: "center" };
