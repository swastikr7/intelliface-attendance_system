// src/pages/Enrollment.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  loadFaceModels,
  computeDescriptorFromImageElement,
  loadLabeledDescriptors,
  saveLabeledDescriptorsToLocalStorage,
  descriptorToJSON,
} from "../utils/faceUtils";

/**
 * Enrollment page (teacher-only) with working camera capture.
 * - Role check is case-insensitive and accepts demo teacher email as fallback.
 * - "Open Camera" now starts webcam, lets teacher capture snapshot, compute descriptor and save enrollment.
 *
 * Replace your current src/pages/Enrollment.jsx with this file.
 */

export default function Enrollment() {
  const auth = useAuth();
  const nav = useNavigate();

  // if not logged in, redirect to login
  if (!auth || !auth.isAuthenticated) {
    nav("/login");
    return null;
  }

  // normalize role/email
  const role = (auth.user?.role || "").toString().toLowerCase();
  const email = (auth.user?.email || "").toString().toLowerCase();

  // teacher allowed if role === "teacher" OR email is teacher@demo.com (fallback)
  const isTeacher = role === "teacher" || email === "teacher@demo.com";

  if (!isTeacher) {
    return (
      <div style={{ padding: 32, maxWidth: 800, margin: "40px auto", color: "#e6eef8" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Access denied</h1>
        <p style={{ marginBottom: 18, color: "rgba(230,238,248,0.8)" }}>
          The Enrollment area is for teachers only. If you are a teacher, please sign in with a teacher account.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => nav("/classroom")}
            style={{
              padding: "10px 14px",
              background: "#fff",
              color: "#0b1220",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Go to Classroom
          </button>

          <button
            onClick={() => {
              auth.logout();
            }}
            style={{
              padding: "10px 14px",
              background: "transparent",
              color: "#fff",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              cursor: "pointer",
            }}
          >
            Sign in as teacher
          </button>
        </div>
      </div>
    );
  }

  // ---------- TEACHER VIEW START ----------
  // Camera / enrollment state
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");

  // load models on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMessage("Loading models...");
      try {
        await loadFaceModels();
        if (!mounted) return;
        setModelsLoaded(true);
        setMessage("Models loaded. Click Open Camera.");
      } catch (err) {
        console.error("Model load error:", err);
        setMessage("Failed to load models. Check /models path.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function openCamera() {
    if (!modelsLoaded) {
      setMessage("Models still loading. Wait a moment.");
      return;
    }
    try {
      setMessage("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
        setMessage("Camera started. Position face and capture.");
      }
    } catch (err) {
      console.error("openCamera error:", err);
      setMessage("Camera permission denied or unavailable.");
    }
  }

  function stopCamera() {
    try {
      const stream = videoRef.current && videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (e) {
      // ignore
    }
    setStreamActive(false);
    setMessage("Camera stopped.");
  }

  function captureSnapshot() {
    if (!videoRef.current) {
      setMessage("Camera not started.");
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedDataUrl(dataUrl);
    setMessage("Snapshot captured. Enter student name/id and Save Enrollment.");
  }

  async function saveEnrollment() {
    if (!capturedDataUrl) {
      setMessage("No snapshot captured. Capture first.");
      return;
    }
    // simple validation
    const nameVal = (studentName || "").trim();
    const idVal = (studentId || "").trim() || `S-${Date.now()}`;

    if (!nameVal) {
      setMessage("Please enter student name before saving.");
      return;
    }

    setSaving(true);
    setMessage("Computing descriptor...");

    try {
      // prepare image element for descriptor computation
      const imgEl = imgRef.current;
      if (!imgEl) {
        setMessage("Preview image not available.");
        setSaving(false);
        return;
      }

      const descriptor = await computeDescriptorFromImageElement(imgEl, { inputSize: 160 });
      if (!descriptor) {
        setMessage("No face detected in the snapshot. Retake photo.");
        setSaving(false);
        return;
      }

      const record = {
        studentId: idVal,
        name: nameVal,
        descriptor: descriptorToJSON(descriptor),
      };

      // merge with existing descriptors and save to localStorage
      const existing = await loadLabeledDescriptors({ localStorageKey: "descriptors" });
      const existingPlain = (existing || []).map((r) => ({
        studentId: r.studentId,
        name: r.name,
        descriptor: Array.isArray(r.descriptor) ? r.descriptor : Array.from(r.descriptor || []),
      }));
      existingPlain.push(record);
      saveLabeledDescriptorsToLocalStorage(existingPlain, { localStorageKey: "descriptors" });

      setMessage(`Enrollment saved for ${nameVal} (${idVal}).`);
      setSaving(false);
      // clear captured preview
      setCapturedDataUrl(null);
      setStudentName("");
      setStudentId("");
    } catch (err) {
      console.error("saveEnrollment error:", err);
      setMessage("Failed to compute/save descriptor. See console.");
      setSaving(false);
    }
  }

  // load enrolled list for UI
  const [enrolled, setEnrolled] = useState([]);
  useEffect(() => {
    const i = setInterval(() => {
      try {
        const list = JSON.parse(localStorage.getItem("descriptors") || "[]");
        setEnrolled(list);
      } catch (e) {
        setEnrolled([]);
      }
    }, 800);
    // initial load
    try {
      setEnrolled(JSON.parse(localStorage.getItem("descriptors") || "[]"));
    } catch (e) {
      setEnrolled([]);
    }
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "24px auto", color: "#e6eef8" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Enrollment (Teachers)</h1>

      <p style={{ marginBottom: 18, color: "rgba(230,238,248,0.85)" }}>
        Use this page to enroll students for face recognition. Capture a clear frontal photo and save.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
          <h3 style={{ marginBottom: 10 }}>Camera</h3>

          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div>
              <video
                ref={videoRef}
                className="rounded border"
                style={{ width: 400, height: 300, backgroundColor: "#000" }}
                autoPlay
                playsInline
                muted
              />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  onClick={openCamera}
                  disabled={streamActive}
                  style={btnStyle(streamActive)}
                >
                  Open Camera
                </button>
                <button
                  onClick={captureSnapshot}
                  disabled={!streamActive}
                  style={btnStyle(!streamActive, "green")}
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  disabled={!streamActive}
                  style={btnStyle(!streamActive, "red")}
                >
                  Stop
                </button>
              </div>
              <div style={{ marginTop: 8, color: "rgba(230,238,248,0.8)" }}>{message}</div>
            </div>

            <div style={{ width: 220 }}>
              <div style={{ fontSize: 13, color: "rgba(230,238,248,0.8)", marginBottom: 8 }}>Preview</div>
              <img
                ref={imgRef}
                src={capturedDataUrl || ""}
                alt="snapshot preview"
                style={{ width: 220, height: 165, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd", background: "#0b1220" }}
              />

              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  placeholder="Student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input-float"
                  style={{ padding: "8px 10px", borderRadius: 6 }}
                />
                <input
                  placeholder="Student ID (optional)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input-float"
                  style={{ padding: "8px 10px", borderRadius: 6 }}
                />

                <button
                  onClick={saveEnrollment}
                  disabled={saving || !capturedDataUrl}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: saving ? "#555" : "#06b6d4",
                    color: "#022",
                    fontWeight: 700,
                    cursor: saving ? "default" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save Enrollment"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4 style={{ marginBottom: 8 }}>Notes</h4>
            <div style={{ color: "rgba(230,238,248,0.75)", fontSize: 13 }}>
              - Capture frontal face, good lighting. <br />
              - Use 2 photos for better results. <br />
              - Descriptors saved to localStorage (demo).
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 8 }}>
          <h3 style={{ marginBottom: 10 }}>Enrolled students (demo)</h3>

          <div style={{ maxHeight: 360, overflow: "auto" }}>
            {enrolled.length === 0 && <div style={{ color: "rgba(230,238,248,0.7)" }}>No enrolled descriptors found (local demo).</div>}
            {enrolled.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: 8, background: "rgba(0,0,0,0.15)", borderRadius: 6, marginBottom: 8 }}>
                <div style={{ width: 56, height: 42, background: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#222" }}>
                  {r.name ? r.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.name || r.studentId}</div>
                  <div style={{ fontSize: 12, color: "rgba(230,238,248,0.7)" }}>{r.studentId}</div>
                </div>
                <div>
                  <button
                    onClick={() => {
                      // quick remove for demo
                      try {
                        const list = JSON.parse(localStorage.getItem("descriptors") || "[]");
                        list.splice(i, 1);
                        localStorage.setItem("descriptors", JSON.stringify(list));
                        setEnrolled(list);
                      } catch (e) { /* ignore */ }
                    }}
                    style={{ padding: "6px 8px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => nav("/dashboard")} style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer" }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// small style helper
function btnStyle(disabled, color = "default") {
  const base = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    cursor: disabled ? "default" : "pointer",
  };
  if (disabled) {
    return { ...base, background: "#555", color: "#ddd" };
  }
  if (color === "green") return { ...base, background: "#16a34a", color: "#fff" };
  if (color === "red") return { ...base, background: "#dc2626", color: "#fff" };
  return { ...base, background: "#1f2937", color: "#fff" };
}
