// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * StudentDashboard.jsx
 *
 * Replaces the "Recent attendance with photos" panel with "Today's lectures"
 * - Reads lectures from localStorage key 'lectures' (array of { id, title, startISO, endISO, room })
 * - Reads attendance from localStorage key 'attendanceRecords' (array of { lectureId, studentId, status, time, confidence })
 * - If none exist, seeds demo data for today so the UI is not empty for demo.
 *
 * Drop this file into src/pages/StudentDashboard.jsx
 */

function isoDateOnly(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function timeRangeDisplay(startISO, endISO) {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    return `${s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return "";
  }
}

export default function StudentDashboard() {
  const auth = useAuth();
  const student = auth?.user || { name: "Student", id: "demo-student", email: "student@demo.com" };

  const [lectures, setLectures] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);

  // load lectures and attendance from localStorage (demo-friendly)
  useEffect(() => {
    // load lectures (seed if empty)
    let rawLectures = [];
    try {
      rawLectures = JSON.parse(localStorage.getItem("lectures") || "null") || [];
    } catch (e) {
      rawLectures = [];
    }

    // seed demo lectures for today if none exist
    if (!rawLectures || rawLectures.length === 0) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const base = `${yyyy}-${mm}-${dd}`;

      rawLectures = [
        { id: "lec-1", title: "Data Structures (Lab)", startISO: `${base}T09:00:00`, endISO: `${base}T10:00:00`, room: "Lab 201" },
        { id: "lec-2", title: "Operating Systems", startISO: `${base}T11:00:00`, endISO: `${base}T12:00:00`, room: "Room 104" },
        { id: "lec-3", title: "Web Dev Workshop", startISO: `${base}T14:00:00`, endISO: `${base}T15:30:00`, room: "Auditorium" },
      ];
      localStorage.setItem("lectures", JSON.stringify(rawLectures));
    }

    // load attendanceRecords
    let records = [];
    try {
      records = JSON.parse(localStorage.getItem("attendanceRecords") || "null") || [];
    } catch (e) {
      records = [];
    }

    // If attendanceRecords empty but faceEvents exist (older demo), map some events for demo
    if ((!records || records.length === 0) && localStorage.getItem("faceEvents")) {
      try {
        const events = JSON.parse(localStorage.getItem("faceEvents") || "[]");
        // map events to attendanceRecords against lec-1 for demo
        records = events.map((ev, i) => ({
          lectureId: rawLectures[i % rawLectures.length]?.id || "lec-1",
          studentId: student.id || student.email || "demo-student",
          status: "present",
          time: ev.time || new Date().toISOString(),
          confidence: ev.confidence || 0.8,
        }));
        localStorage.setItem("attendanceRecords", JSON.stringify(records));
      } catch (e) {
        // ignore
      }
    }

    // filter lectures for today only
    const todayISO = isoDateOnly(new Date());
    const todays = rawLectures.filter((l) => isoDateOnly(l.startISO) === todayISO);
    setLectures(todays);
    setAttendance(records);
  }, [auth]);

  // helper to find a student's attendance record for a lecture
  function findAttendance(lectureId) {
    const rec = (attendance || []).find((r) => r.lectureId === lectureId && (r.studentId === (student.id || student.email)));
    return rec || null;
  }

  // UI action: mark absent (demo-only) — stores to localStorage
  function markAbsent(lectureId) {
    const rec = { lectureId, studentId: student.id || student.email, status: "absent", time: new Date().toISOString() };
    const next = (attendance || []).filter((r) => !(r.lectureId === lectureId && r.studentId === student.id)).concat(rec);
    setAttendance(next);
    localStorage.setItem("attendanceRecords", JSON.stringify(next));
  }

  // UI action: refresh (re-read localStorage)
  function refreshData() {
    try {
      const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
      setAttendance(records);
      const rawLectures = JSON.parse(localStorage.getItem("lectures") || "[]");
      const todayISO = isoDateOnly(new Date());
      setLectures((rawLectures || []).filter((l) => isoDateOnly(l.startISO) === todayISO));
    } catch (e) {
      // ignore
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "20px auto", color: "#e6eef8" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {student.name}</h2>
          <div style={{ color: "rgba(230,238,248,0.75)", fontSize: 14 }}>This is your student dashboard.</div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={refreshData} style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer" }}>Refresh</button>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Today's lectures</h3>

          {lectures.length === 0 && (
            <div style={{ color: "rgba(230,238,248,0.7)" }}>No lectures scheduled for today.</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lectures.map((lec) => {
              const rec = findAttendance(lec.id);
              const status = rec ? (rec.status === "present" ? "Present" : "Absent") : "Not marked";
              return (
                <div key={lec.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.12)" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{lec.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(230,238,248,0.8)" }}>{timeRangeDisplay(lec.startISO, lec.endISO)} • {lec.room}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 6, fontWeight: 700, color: status === "Present" ? "#16a34a" : status === "Absent" ? "#dc2626" : "#f59e0b" }}>{status}</div>
                    {rec && rec.time && <div style={{ fontSize: 12, color: "rgba(230,238,248,0.7)" }}>{new Date(rec.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                    <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {!rec && <button onClick={() => markAbsent(lec.id)} style={{ padding: "6px 8px", borderRadius: 6 }}>Mark Absent</button>}
                      <button onClick={() => setSelectedLecture(lec)} style={{ padding: "6px 8px", borderRadius: 6 }}>Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
          <h4 style={{ marginTop: 0 }}>Today's summary</h4>
          <div style={{ fontSize: 14, color: "rgba(230,238,248,0.85)" }}>
            Lectures: <strong>{lectures.length}</strong>
            <br />
            Present: <strong>{lectures.filter(l => findAttendance(l.id)?.status === "present").length}</strong>
            <br />
            Absent: <strong>{lectures.filter(l => findAttendance(l.id)?.status === "absent").length}</strong>
          </div>

          <div style={{ marginTop: 12 }}>
            <h5 style={{ marginBottom: 8 }}>Recent activity (demo)</h5>
            <div style={{ maxHeight: 220, overflow: "auto" }}>
              {(attendance || []).slice(0, 8).map((a, i) => (
                <div key={i} style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.status === "present" ? "Checked in" : "Marked absent"}</div>
                  <div style={{ fontSize: 12, color: "rgba(230,238,248,0.7)" }}>{new Date(a.time).toLocaleString()}</div>
                </div>
              ))}
              {(attendance || []).length === 0 && <div style={{ color: "rgba(230,238,248,0.7)" }}>No recent activity</div>}
            </div>
          </div>
        </aside>
      </section>

      {/* Selected lecture details modal-like inline */}
      {selectedLecture && (
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800 }}>{selectedLecture.title}</div>
              <div style={{ fontSize: 13, color: "rgba(230,238,248,0.8)" }}>{timeRangeDisplay(selectedLecture.startISO, selectedLecture.endISO)} • {selectedLecture.room}</div>
            </div>
            <div>
              <button onClick={() => setSelectedLecture(null)} style={{ padding: "6px 8px", borderRadius: 6 }}>Close</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4 style={{ marginBottom: 6 }}>Attendance</h4>
            <div style={{ color: "rgba(230,238,248,0.85)" }}>
              {(() => {
                const rec = findAttendance(selectedLecture.id);
                if (!rec) return <div>Not marked yet.</div>;
                return (
                  <div>
                    <div>Status: <strong>{rec.status}</strong></div>
                    <div>Time: {new Date(rec.time).toLocaleString()}</div>
                    {typeof rec.confidence === "number" && <div>Confidence: {(rec.confidence * 100).toFixed(0)}%</div>}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
