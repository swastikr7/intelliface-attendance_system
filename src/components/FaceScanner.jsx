// src/components/FaceScanner.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  loadFaceModels,
  computeDescriptorFromVideo,
  loadLabeledDescriptors,
  findBestMatch,
} from "../utils/faceUtils";

/**
 * FaceScanner.jsx (fixed)
 *
 * - Loads face-api models and labeled descriptors (localStorage '/descriptors' or '/descriptors.json')
 * - Starts camera & continuously computes descriptors from the video feed
 * - Matches with labeled descriptors, requires consecutive frames to confirm
 * - Builds a snapshot, calls onMarkAttendance({ studentId, name, confidence, snapshot, method })
 * - Updates the local "Recent Marks" list (stored in localStorage 'faceEvents') and shows it immediately
 *
 * Props:
 *  - onMarkAttendance: async function called when a match is confirmed
 *  - autoStart: boolean - start camera automatically on mount (default false)
 *
 * Notes:
 *  - Uses euclidean-distance-based thresholds. Confidence is approximated as clamp(1 - distance, 0, 1).
 *  - For a more precise overlay bbox you can run an explicit face detector; this component keeps the overlay simple.
 */

export default function FaceScanner({ onMarkAttendance = null, autoStart = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // overlay / snapshot drawing
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("faceEvents") || "[]"));
  const labeledRef = useRef([]); // [{ studentId, name, descriptor: Float32Array }]

  // thresholds & settings
  const AUTO_THRESHOLD = 0.50; // euclidean distance <= this => auto-mark candidate
  const CONFIRM_THRESHOLD = 0.58; // between auto and confirm -> possible
  const CONSECUTIVE_REQUIRED = 3; // consecutive frames of same best match to confirm
  const PAUSE_AFTER_MARK_MS = 1800;

  // detection state
  const consecutiveRef = useRef(0);
  const lastBestRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      setStatus("Loading models...");
      try {
        await loadFaceModels();
        setStatus("Models loaded.");
      } catch (err) {
        console.error("FaceScanner: model load failed", err);
        setStatus("Model load failed. Check /models.");
        return;
      }

      setStatus("Loading enrolled descriptors...");
      try {
        const labeled = await loadLabeledDescriptors();
        labeledRef.current = (labeled || []).map((r) => ({
          studentId: r.studentId,
          name: r.name,
          descriptor: r.descriptor instanceof Float32Array ? r.descriptor : Float32Array.from(r.descriptor || []),
        }));
        setStatus("Ready");
      } catch (err) {
        console.warn("FaceScanner: no labeled descriptors found", err);
        labeledRef.current = [];
        setStatus("Ready (no enrolled descriptors)");
      }

      if (autoStart) {
        startCamera();
      }
    })();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start camera + detection
  async function startCamera() {
    if (running) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Camera API not supported");
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
        // Ensure play
        // Some browsers require a short await after setting srcObject
        await videoRef.current.play().catch(() => {});
        // size overlay canvas to video
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
      lastBestRef.current = null;
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error("FaceScanner startCamera error:", err);
      setStatus("Camera permission denied or unavailable.");
    }
  }

  // stop everything
  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      const s = videoRef.current && videoRef.current.srcObject;
      if (s && s.getTracks) {
        s.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      // ignore
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    // clear overlay
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setRunning(false);
    setStatus("Stopped");
    consecutiveRef.current = 0;
    lastBestRef.current = null;
  }

  // helper: snapshot dataURL from video
  function createSnapshotDataUrl() {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  }

  // main loop
  async function detectLoop() {
    if (!mountedRef.current) return;
    if (!running) {
      rafRef.current = null;
      return;
    }

    try {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      // compute descriptor for current frame (null if no face)
      const descriptor = await computeDescriptorFromVideo(videoRef.current, { inputSize: 160 });
      if (descriptor) {
        const best = findBestMatch(descriptor, labeledRef.current || []);
        if (best && best.studentId) {
          // best.distance: lower = more similar
          if (best.distance <= AUTO_THRESHOLD) {
            // consecutive logic
            if (lastBestRef.current && lastBestRef.current.studentId === best.studentId) {
              consecutiveRef.current++;
            } else {
              consecutiveRef.current = 1;
              lastBestRef.current = best;
            }

            setStatus(`Matched ${best.name} — ${consecutiveRef.current}/${CONSECUTIVE_REQUIRED}`);

            if (consecutiveRef.current >= CONSECUTIVE_REQUIRED) {
              // confirmed match: build snapshot + overlay + call handler
              const snapshot = createSnapshotDataUrl();

              // draw snapshot + centered box for quick visual feedback
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                const img = new Image();
                img.onload = () => {
                  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                  ctx.lineWidth = 3;
                  ctx.strokeStyle = "#22c55e";
                  const bw = canvasRef.current.width * 0.38;
                  const bh = canvasRef.current.height * 0.55;
                  const bx = (canvasRef.current.width - bw) / 2;
                  const by = (canvasRef.current.height - bh) / 2;
                  ctx.strokeRect(bx, by, bw, bh);
                  ctx.fillStyle = "#22c55e";
                  ctx.font = "18px Arial";
                  const confidence = Math.max(0, Math.min(1, 1 - best.distance));
                  ctx.fillText(`${best.name} • ${(confidence * 100).toFixed(0)}%`, bx + 8, by + 22);
                };
                img.src = snapshot;
              }

              // compute clamped confidence
              const confidence = Math.max(0, Math.min(1, 1 - best.distance));

              // call parent handler if provided
              try {
                setStatus(`Confirmed ${best.name}. Marking...`);
                if (typeof onMarkAttendance === "function") {
                  // await in case parent updates localStorage / state
                  await onMarkAttendance({
                    studentId: best.studentId,
                    name: best.name,
                    confidence,
                    snapshot,
                    method: "face",
                  });
                } else {
                  // save to demo localStorage log
                  const newEvent = {
                    studentId: best.studentId,
                    name: best.name,
                    time: new Date().toISOString(),
                    confidence,
                    snapshot,
                  };
                  const prev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
                  prev.unshift(newEvent);
                  const sliced = prev.slice(0, 200);
                  localStorage.setItem("faceEvents", JSON.stringify(sliced));
                  setEvents(sliced);
                }
              } catch (err) {
                console.error("FaceScanner: onMarkAttendance handler threw", err);
              }

              // pause detection briefly to avoid duplicate marks
              consecutiveRef.current = 0;
              lastBestRef.current = null;
              setTimeout(() => {
                if (running) {
                  setStatus("Detecting...");
                  rafRef.current = requestAnimationFrame(detectLoop);
                }
              }, PAUSE_AFTER_MARK_MS);

              return; // exit this iteration (we'll resume after pause)
            }
          } else if (best.distance <= CONFIRM_THRESHOLD) {
            // possible match but not confident enough for auto mark
            setStatus(`Possible ${best.name} (d=${best.distance.toFixed(3)}). Hold steady...`);
            consecutiveRef.current = 0;
            lastBestRef.current = best;
          } else {
            setStatus("Face seen — no match");
            consecutiveRef.current = 0;
            lastBestRef.current = null;
            // clear overlay
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        } else {
          setStatus("Face detected (not enrolled)");
        }
      } else {
        // no face found this frame
        setStatus("No face detected");
        consecutiveRef.current = 0;
        lastBestRef.current = null;
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    } catch (err) {
      console.error("FaceScanner detectLoop error:", err);
      setStatus("Detection error");
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }

  // UI: refresh events from localStorage (useful if parent updated them)
  function refreshEventsFromStorage() {
    const ev = JSON.parse(localStorage.getItem("faceEvents") || "[]");
    setEvents(ev);
  }

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Face Recognition (Camera)</div>

      <div style={{ position: "relative", background: "#000", borderRadius: 8, overflow: "hidden" }}>
        <video
          ref={videoRef}
          style={{ width: "100%", height: "auto", display: "block", background: "#000" }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={startCamera}
            disabled={running}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: running ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              cursor: running ? "default" : "pointer",
            }}
          >
            Start Camera
          </button>

          <button
            onClick={stopCamera}
            disabled={!running}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: !running ? "#9ca3af" : "#dc2626",
              color: "#fff",
              border: "none",
              cursor: !running ? "default" : "pointer",
            }}
          >
            Stop
          </button>

          <button
            onClick={refreshEventsFromStorage}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "#111827",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
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
              <img
                src={e.snapshot}
                alt="snap"
                style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 6, background: "#fff" }}
              />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700 }}>{e.name}</div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(e.time).toLocaleString()} • {(e.confidence * 100 || 0).toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
