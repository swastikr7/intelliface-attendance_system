// src/pages/TeacherDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FaceScanner from "../components/FaceScanner";
import { loadLabeledDescriptors } from "../utils/faceUtils"; // optional: to count enrolled students
import * as mockApi from "../api/mockApi";

/*
 TeacherDashboard.jsx (face-monitor + enrollment link)
 - Shows class summary (derived from localStorage or mockApi)
 - Start/Stop session runs FaceScanner in a right-hand panel
 - Recent check-ins come from localStorage 'faceEvents' (written by FaceScanner) and attendanceRecords
 - Exports recent checkins (faceEvents) to CSV
 - Link to /enroll (teacher enrollment page) remains available
*/

export default function TeacherDashboard() {
  const nav = useNavigate();

  const [summary, setSummary] = useState({ totalStudents: "—", presentToday: "—", avgEngagement: "—" });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const pollRef = useRef(null);

  // load initial data (try localStorage descriptors/attendance first, else fallback to mockApi)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // count enrolled students from descriptors in localStorage (key "descriptors")
        let totalStudents = "—";
        try {
          const raw = localStorage.getItem("descriptors");
          if (raw) {
            const parsed = JSON.parse(raw);
            totalStudents = Array.isArray(parsed) ? parsed.length : "—";
          } else {
            // fallback to loadLabeledDescriptors util if present
            try {
              const labeled = await loadLabeledDescriptors();
              totalStudents = Array.isArray(labeled) ? labeled.length : "—";
            } catch {
              totalStudents = "—";
            }
          }
        } catch {
          totalStudents = "—";
        }

        // presentToday: try attendanceRecords in localStorage (key attendanceRecords or attendance)
        let presentToday = "—";
        try {
          const ar = JSON.parse(localStorage.getItem("attendanceRecords") || localStorage.getItem("attendance") || "[]");
          const today = new Date().toISOString().slice(0, 10);
          presentToday = ar.filter((r) => r.timestampISO ? r.timestampISO.slice(0, 10) === today : (r.time ? r.time.slice(0, 10) === today : false)).length;
        } catch {
          presentToday = "—";
        }

        // avg engagement (mock): attempt from mockApi or random demo value
        let avgEngagement = "—";
        try {
          if (mockApi && mockApi.fetchClassSummary) {
            const s = await mockApi.fetchClassSummary();
            if (s && typeof s.avgEngagement === "number") {
              avgEngagement = s.avgEngagement;
            }
          }
          if (avgEngagement === "—") avgEngagement = Math.round(60 + Math.random() * 30);
        } catch {
          avgEngagement = Math.round(60 + Math.random() * 30);
        }

        if (!mounted) return;
        setSummary({ totalStudents, presentToday, avgEngagement });
      } catch (err) {
        console.error("TeacherDashboard init error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // initial recent events load
    refreshRecentFromStorage();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll recent events while session is active to keep UI live with any external changes
  function startSession() {
    if (sessionActive) return;
    setSessionActive(true);
    // start a short poll to refresh recent events & stats
    pollRef.current = setInterval(() => {
      refreshRecentFromStorage();
      // update summary counts again (quick)
      try {
        const ar = JSON.parse(localStorage.getItem("attendanceRecords") || localStorage.getItem("attendance") || "[]");
        const today = new Date().toISOString().slice(0, 10);
        const presentToday = ar.filter((r) => r.timestampISO ? r.timestampISO.slice(0, 10) === today : (r.time ? r.time.slice(0, 10) === today : false)).length;
        setSummary((prev) => ({ ...prev, presentToday }));
      } catch {
        // ignore
      }
    }, 1500);
  }

  function stopSession() {
    setSessionActive(false);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Refresh "recent" from localStorage faceEvents or fallback to mockApi
  async function refreshRecentFromStorage() {
    try {
      const ev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
      if (Array.isArray(ev) && ev.length > 0) {
        setRecent(ev.slice(0, 50));
        return;
      }
      // fallback to attendanceRecords rendered in a compatible recent shape
      const ar = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
      if (Array.isArray(ar) && ar.length > 0) {
        const shaped = ar.slice(0, 50).map((r) => ({
          email: r.studentId || r.name || "unknown",
          ts: r.time || r.timestampISO || new Date().toISOString(),
          status: r.status || "present",
          image: r.snapshot || null,
          confidence: r.confidence || r.distance || null,
        }));
        setRecent(shaped);
        return;
      }
      // fallback to mockApi
      if (mockApi && mockApi.fetchRecentCheckins) {
        const m = await mockApi.fetchRecentCheckins(12);
        setRecent(m || []);
        return;
      }
      setRecent([]);
    } catch (err) {
      console.error("refreshRecentFromStorage", err);
      setRecent([]);
    }
  }

  // Called by FaceScanner when a confirmed match occurs
  // we accept the event and persist it into faceEvents + attendanceRecords
  async function handleLiveMark({ studentId, name, confidence, snapshot, method = "face" }) {
    try {
      const timestampISO = new Date().toISOString();
      const event = {
        studentId,
        name,
        time: timestampISO,
        confidence: typeof confidence === "number" ? confidence : null,
        snapshot: snapshot || null,
        method,
      };

      // save into faceEvents (audit)
      const prev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
      prev.unshift(event);
      const sliced = prev.slice(0, 200);
      localStorage.setItem("faceEvents", JSON.stringify(sliced));

      // save attendanceRecords for student-facing dashboards (if not already present for same lecture/time)
      // Attendance record shape used elsewhere: { lectureId?, studentId, status, time, confidence, snapshot }
      const attendanceKey = "attendanceRecords";
      const araw = JSON.parse(localStorage.getItem(attendanceKey) || "[]");
      // For teacher demo we won't attach lectureId here (could be added by UI)
      const arec = {
        lectureId: null,
        studentId: studentId,
        status: "present",
        time: timestampISO,
        confidence: typeof confidence === "number" ? confidence : null,
        snapshot: snapshot || null,
      };
      araw.unshift(arec);
      localStorage.setItem(attendanceKey, JSON.stringify(araw.slice(0, 200)));

      // update UI immediately
      setRecent((r) => [ { email: studentId || name, ts: timestampISO, status: "present", image: snapshot || null, confidence: arec.confidence }, ...(r || []) ].slice(0, 200));
      // update summary present count
      setSummary((prev) => {
        const presentToday = typeof prev.presentToday === "number" ? prev.presentToday + 1 : prev.presentToday;
        return { ...prev, presentToday };
      });
    } catch (err) {
      console.error("handleLiveMark error", err);
    }
  }

  // Export recent checkins (faceEvents preferred)
  function exportCSV() {
    try {
      const ev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
      const rowsSource = Array.isArray(ev) && ev.length > 0 ? ev.map((e) => ({
        email: e.studentId || e.name,
        ts: e.time,
        status: "present",
        note: `confidence:${(e.confidence||0).toFixed ? (e.confidence||0).toFixed(3) : e.confidence || ""}`
      })) : recent.map((r) => ({ email: r.email || r.studentId || r.name, ts: r.ts, status: r.status, note: r.note || "" }));

      if (!rowsSource || rowsSource.length === 0) return;

      const rows = [
        ["email", "timestamp", "status", "note"],
        ...rowsSource.map((r) => [r.email, r.ts, r.status, (r.note || "").replace(/\n/g, " ")]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `intelliface-checkins-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("exportCSV error", err);
    }
  }

  // UI
  return (
    <div style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, Teacher</h2>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>Teacher dashboard — manage sessions & attendance.</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!sessionActive ? (
            <button className="btn btn-primary" onClick={() => { startSession(); setSessionActive(true); }}>
              Start Session
            </button>
          ) : (
            <button className="btn-outline" onClick={() => { stopSession(); setSessionActive(false); }}>
              Stop Session
            </button>
          )}
          <button className="btn-outline" onClick={exportCSV} title="Export recent check-ins">Export CSV</button>
          <Link to="/enroll">
            <button className="btn-outline" style={{ marginLeft: 6 }}>Go to Enrollment</button>
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Total students</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary ? summary.totalStudents : "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Present today</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary ? summary.presentToday : "—"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Avg engagement</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary ? `${summary.avgEngagement}%` : "—"}</div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Live recent check-ins</h3>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>Latest images & timestamps (face-events or attendanceRecords)</p>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {loading && <div style={{ color: "var(--muted)" }}>Loading...</div>}
            {!loading && (!recent || recent.length === 0) && <div style={{ color: "var(--muted)" }}>No recent check-ins.</div>}

            {!loading && recent.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: 10, borderRadius: 8, background: "rgba(0,0,0,0.08)" }}>
                <div style={{ width: 72, height: 54, overflow: "hidden", borderRadius: 6, background: "#000" }}>
                  {r.image || r.snapshot ? <img src={r.image || r.snapshot} alt="c" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{r.email || r.studentId || r.name}</div>
                  <div style={{ color: "var(--muted)" }}>{new Date(r.ts || r.time || r.timestampISO || r.time).toLocaleString()}</div>
                </div>

                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {r.status || "present"} {r.confidence ? `• ${(r.confidence * 100).toFixed(0)}%` : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ position: "relative" }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700 }}>Live Monitor</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{sessionActive ? "Session active" : "Session stopped"}</div>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
            {/* Show FaceScanner only when session active */}
            {sessionActive ? (
              <FaceScanner
                autoStart={true}
                // When FaceScanner detects a face and confirms, it calls this
                onMarkAttendance={async ({ studentId, name, confidence, snapshot, method }) => {
                  // Accept the event into teacher's recent list & persist
                  await handleLiveMark({ studentId, name, confidence, snapshot, method });
                }}
              />
            ) : (
              <div style={{ padding: 16, borderRadius: 8, background: "#071024" }}>
                <div style={{ color: "var(--muted)" }}>Start session to activate live camera monitor.</div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>You can still enroll students from the Enrollment page.</div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const cardStyle = {
  padding: 14,
  borderRadius: 10,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.03)",
};
