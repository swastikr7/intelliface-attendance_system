// src/components/FaceScanner.jsx
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import {
  loadFaceModels,
  // keep compatibility if your utils expose helpers; we'll use faceapi directly for landmarks
} from "../utils/faceUtils";

/**
 * FaceScanner.jsx — with simple anti-spoof (challenge-response) added
 *
 * Features:
 * - Loads face-api models via loadFaceModels()
 * - Starts/stops camera, detects faces and landmarks
 * - Performs descriptor matching (simple euclidean match against labeled descriptors in localStorage 'descriptors')
 * - Requires consecutive frames (CONSECUTIVE_REQUIRED) AND passes a random challenge (blink/look-left) before final mark
 * - Saves snapshot to localStorage 'faceEvents' and attendanceRecords (for student dashboards)
 *
 * Notes:
 * - This is a demo-friendly anti-spoof approach. For production, integrate a proper liveness model or SDK.
 */

const AUTO_THRESHOLD = 0.50; // matching distance threshold (lower = stricter)
const CONSECUTIVE_REQUIRED = 3; // frames required
const CHALLENGE_TIMEOUT_MS = 3500; // time to complete challenge
const PAUSE_AFTER_MARK_MS = 1400; // pause after a successful mark

function distance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

// Eye Aspect Ratio helper (using landmarks points)
function eyeAspectRatio(eye) {
  // eye: array of 6 points
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const A = dist(eye[1], eye[5]);
  const B = dist(eye[2], eye[4]);
  const C = dist(eye[0], eye[3]);
  if (C === 0) return 1;
  return (A + B) / (2.0 * C);
}

function avgEAR(landmarks) {
  try {
    const left = landmarks.getLeftEye().map((p) => ({ x: p.x, y: p.y }));
    const right = landmarks.getRightEye().map((p) => ({ x: p.x, y: p.y }));
    return (eyeAspectRatio(left) + eyeAspectRatio(right)) / 2;
  } catch {
    return null;
  }
}

export default function FaceScanner({ onMarkAttendance = null, autoStart = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("faceEvents") || "[]");
    } catch {
      return [];
    }
  });

  // labeled descriptors read from localStorage 'descriptors' (records with descriptors array)
  const labeledRef = useRef([]); // [{ studentId, name, descriptors: [ [num..], ... ] }]

  // detection state
  const consecutiveRef = useRef(0);
  const lastBestIdRef = useRef(null);
  const mountedRef = useRef(true);

  // Challenge state
  const [challenge, setChallenge] = useState(null); // { type: 'blink'|'look-left', expires: timestamp }
  const challengeTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      setStatus("Loading models...");
      try {
        await loadFaceModels(); // uses your utils to load models from /models
        setStatus("Models loaded.");
      } catch (err) {
        console.error("loadFaceModels failed", err);
        setStatus("Model load failed");
        return;
      }

      // load labeled descriptors (from localStorage 'descriptors')
      try {
        const raw = JSON.parse(localStorage.getItem("descriptors") || "[]");
        labeledRef.current = Array.isArray(raw) ? raw : [];
      } catch {
        labeledRef.current = [];
      }

      if (autoStart) startCamera();
    })();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [autoStart]);

  async function startCamera() {
    if (running) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera API not available");
      return;
    }
    setStatus("Starting camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        // size canvas to video
        const w = videoRef.current.videoWidth || 640;
        const h = videoRef.current.videoHeight || 480;
        if (canvasRef.current) {
          canvasRef.current.width = w;
          canvasRef.current.height = h;
        }
      }
      setRunning(true);
      setStatus("Detecting...");
      consecutiveRef.current = 0;
      lastBestIdRef.current = null;
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error("startCamera", err);
      setStatus("Camera permission denied");
    }
  }

  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      const s = videoRef.current && videoRef.current.srcObject;
      if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
    } catch {}
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setRunning(false);
    setStatus("Stopped");
    consecutiveRef.current = 0;
    lastBestIdRef.current = null;
    clearChallenge();
  }

  function clearChallenge() {
    setChallenge(null);
    if (challengeTimerRef.current) {
      clearTimeout(challengeTimerRef.current);
      challengeTimerRef.current = null;
    }
  }

  function pushFaceEvent(e) {
    const prev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
    prev.unshift(e);
    const sliced = prev.slice(0, 200);
    localStorage.setItem("faceEvents", JSON.stringify(sliced));
    setEvents(sliced);
  }

  function saveAttendanceRecord(record) {
    try {
      const key = "attendanceRecords";
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      raw.unshift(record);
      localStorage.setItem(key, JSON.stringify(raw.slice(0, 500)));
    } catch (e) {
      console.error("saveAttendanceRecord", e);
    }
  }

  function captureSnapshotDataUrl() {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  }

  // simple matching: compute average distance between probe and stored descriptors per student
  function findBestMatchLocal(probeDescriptor) {
    if (!probeDescriptor) return { studentId: null, name: null, distance: Infinity };
    const labeled = labeledRef.current || [];
    let best = { studentId: null, name: null, distance: Infinity };
    for (const rec of labeled) {
      const arrs = rec.descriptors || rec.descriptor ? (rec.descriptors || [rec.descriptor]) : [];
      if (!Array.isArray(arrs) || arrs.length === 0) continue;
      let tot = 0, cnt = 0;
      for (const d of arrs) {
        const dist = distance(probeDescriptor, d);
        if (isFinite(dist)) { tot += dist; cnt++; }
      }
      const avg = cnt === 0 ? Infinity : (tot / cnt);
      if (avg < best.distance) {
        best = { studentId: rec.studentId || rec.id || rec.email || null, name: rec.name || null, distance: avg };
      }
    }
    return best;
  }

  // challenge generation: returns 'blink' or 'look-left'
  function genChallenge() {
    const choices = ["blink", "look-left"];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // detection loop: uses faceapi.detectSingleFace with landmarks + descriptor
  async function detectLoop() {
    if (!mountedRef.current || !running) return;

    try {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks().withFaceDescriptor();
      if (detection && detection.descriptor) {
        // compute EAR for blink detection
        const landmarks = detection.landmarks;
        const ear = avgEAR(landmarks);

        // perform matching
        const best = findBestMatchLocal(detection.descriptor);
        if (best && best.studentId && best.distance <= AUTO_THRESHOLD) {
          // require challenge
          if (!challenge) {
            // create challenge and set timeout
            const ch = genChallenge();
            setChallenge({ type: ch, expires: Date.now() + CHALLENGE_TIMEOUT_MS });
            // auto-clear after timeout
            challengeTimerRef.current = setTimeout(() => {
              // challenge failed
              setStatus("Challenge timed out — try again");
              clearChallenge();
            }, CHALLENGE_TIMEOUT_MS);
            setStatus(`Matched ${best.name}. Please ${ch.replace("-", " ")}`);
            consecutiveRef.current = 0;
            lastBestIdRef.current = best.studentId;
          } else {
            // challenge active: check for success
            const now = Date.now();
            if (now > (challenge.expires || 0)) {
              // expired, handled by timer, but ensure cleared
              clearChallenge();
            } else {
              let success = false;
              if (challenge.type === "blink") {
                // detect blink: EAR drops below threshold then rises — simple approach: EAR < 0.18 indicates blink
                if (ear !== null && ear < 0.18) {
                  // wait for eye open in subsequent frames; we approximate by requiring EAR < 0.18 now
                  success = true;
                }
              } else if (challenge.type === "look-left") {
                // estimate head/eye orientation: compare eye centers x vs nose.x
                try {
                  const leftEye = landmarks.getLeftEye();
                  const rightEye = landmarks.getRightEye();
                  const nose = landmarks.getNose();
                  const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
                  const noseX = nose[3].x; // approximate center of nose
                  // if eye center is significantly to the right of nose => looking left (camera space)
                  if ((eyeCenterX - noseX) > 6) success = true;
                } catch {}
              }

              if (success) {
                // require consecutive frames for robustness
                if (lastBestIdRef.current && lastBestIdRef.current === best.studentId) {
                  consecutiveRef.current++;
                } else {
                  consecutiveRef.current = 1;
                  lastBestIdRef.current = best.studentId;
                }
                setStatus(`Challenge success (${consecutiveRef.current}/${CONSECUTIVE_REQUIRED})`);
                if (consecutiveRef.current >= CONSECUTIVE_REQUIRED) {
                  // confirmed — mark attendance
                  const snapshot = captureSnapshotDataUrl();
                  const confidence = Math.max(0, Math.min(1, 1 - best.distance));
                  const event = {
                    studentId: best.studentId,
                    name: best.name,
                    time: new Date().toISOString(),
                    confidence,
                    snapshot,
                    method: "face+challenge",
                  };
                  pushFaceEvent(event);
                  saveAttendanceRecord({
                    lectureId: null,
                    studentId: event.studentId,
                    status: "present",
                    time: event.time,
                    confidence: event.confidence,
                    snapshot: event.snapshot,
                  });
                  if (typeof onMarkAttendance === "function") {
                    try {
                      await onMarkAttendance({ studentId: event.studentId, name: event.name, confidence: event.confidence, snapshot: event.snapshot, method: event.method });
                    } catch (err) {
                      console.error("onMarkAttendance handler error", err);
                    }
                  }
                  setStatus(`Marked ${event.name}`);
                  clearChallenge();
                  consecutiveRef.current = 0;
                  lastBestIdRef.current = null;
                  // pause detection briefly
                  setTimeout(() => {
                    if (running) {
                      setStatus("Detecting...");
                      rafRef.current = requestAnimationFrame(detectLoop);
                    }
                  }, PAUSE_AFTER_MARK_MS);
                  return; // skip scheduling RAF now
                }
              } else {
                // not success yet — keep waiting
                setStatus(`Please ${challenge.type.replace("-", " ")}`);
              }
            }
          }
        } else {
          // no good match — reset challenge and status
          setStatus("Face detected — no enrolled match");
          consecutiveRef.current = 0;
          lastBestIdRef.current = null;
          // clear overlay
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }

        // draw small overlay preview (label + confidence)
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const snap = captureSnapshotDataUrl();
          if (snap) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.lineWidth = 2;
              ctx.strokeStyle = "#22c55e";
              const bw = canvasRef.current.width * 0.36;
              const bh = canvasRef.current.height * 0.5;
              const bx = (canvasRef.current.width - bw) / 2;
              const by = (canvasRef.current.height - bh) / 2;
              ctx.strokeRect(bx, by, bw, bh);
              ctx.fillStyle = "#fff";
              ctx.font = "16px Arial";
              ctx.fillText(status, 8, 20);
            };
            img.src = snap;
          }
        }
      } else {
        setStatus("No face detected");
        consecutiveRef.current = 0;
        lastBestIdRef.current = null;
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (err) {
      console.error("detectLoop error", err);
      setStatus("Detection error");
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Face Recognition (Camera)</div>

      <div style={{ position: "relative", background: "#000", borderRadius: 8, overflow: "hidden" }}>
        <video ref={videoRef} className="w-full" style={{ display: "block", width: "100%" }} autoPlay playsInline muted />
        <canvas ref={canvasRef} className="absolute left-0 top-0 w-full h-full pointer-events-none" style={{ width: "100%", height: "100%" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startCamera} disabled={running} style={{ padding: "8px 12px", borderRadius: 8, background: running ? "#9ca3af" : "#2563eb", color: "#fff", border: "none" }}>
            Start Camera
          </button>
          <button onClick={stopCamera} disabled={!running} style={{ padding: "8px 12px", borderRadius: 8, background: !running ? "#9ca3af" : "#dc2626", color: "#fff", border: "none" }}>
            Stop
          </button>
          <button onClick={() => { const ev = JSON.parse(localStorage.getItem("faceEvents")||"[]"); setEvents(ev); }} style={{ padding: "8px 12px", borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>
            Refresh Marks
          </button>
        </div>

        <div style={{ fontSize: 13, color: "#94a3b8" }}>{status}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Recent Marks (demo)</div>
        <div style={{ maxHeight: 180, overflow: "auto", borderRadius: 8, padding: 6, background: "#0b1220" }}>
          {(!events || events.length === 0) && <div style={{ color: "#94a3b8", fontSize: 13 }}>No marks yet.</div>}
          {(events || []).map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: 6, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <img src={e.snapshot} alt="snap" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 6 }} />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700 }}>{e.name || e.studentId}</div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(e.time).toLocaleString()} • {(e.confidence*100||0).toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
