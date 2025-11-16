// src/components/StudentCheckIn.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  loadFaceModels,
  computeDescriptorFromImageElement,
  loadLabeledDescriptors,
  findBestMatch,
  saveAttendanceRecord,
  hasCheckedInToday,
} from "../utils/faceUtils";

export default function StudentCheckIn() {
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [message, setMessage] = useState("");
  const [lastAttendance, setLastAttendance] = useState(null);
  const THRESHOLD = 0.6;

  useEffect(() => {
    (async () => {
      setMessage("Loading face models...");
      try {
        await loadFaceModels();
        setModelsLoaded(true);
        setMessage("Models ready. Start camera to check-in.");
      } catch (err) {
        console.error("Model load error:", err);
        setMessage("Failed to load models. Check /models path.");
      }
    })();
  }, []);

  async function openCamera() {
    if (!modelsLoaded) {
      setMessage("Models still loading...");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
        setMessage("Camera started. Position face and press Capture.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Camera unavailable or permission denied.");
    }
  }

  function stopCamera() {
    try {
      const stream = videoRef.current && videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (e) {}
    setStreamActive(false);
    setMessage("Camera stopped.");
  }

  function captureToPreview() {
    if (!videoRef.current) {
      setMessage("Start camera first.");
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    if (imgRef.current) imgRef.current.src = dataUrl;
    setMessage("Snapshot ready. Press Save Check-in to match.");
  }

  async function saveCheckIn() {
    setMessage("Computing descriptor...");
    try {
      const imgEl = imgRef.current;
      if (!imgEl || !imgEl.src) {
        setMessage("No snapshot — capture first.");
        return;
      }
      const descriptor = await computeDescriptorFromImageElement(imgEl, { inputSize: 160 });
      if (!descriptor) {
        setMessage("No face detected. Retake snapshot.");
        return;
      }

      const enrolled = await loadLabeledDescriptors({ localStorageKey: "descriptors" });
      if (!enrolled || enrolled.length === 0) {
        setMessage("No enrolled students found. Ask teacher to enroll first.");
        return;
      }

      const { bestMatch, distance } = findBestMatch(Array.from(descriptor), enrolled, THRESHOLD);

      if (bestMatch) {
        // prevent duplicate same-day check-ins
        if (hasCheckedInToday(bestMatch.studentId)) {
          setMessage(`${bestMatch.name} already checked in today.`);
          return;
        }

        const record = {
          studentId: bestMatch.studentId,
          name: bestMatch.name,
          timestampISO: new Date().toISOString(),
          status: "Present",
          distance,
        };
        saveAttendanceRecord(record, { localStorageKey: "attendance" });
        setLastAttendance(record);
        setMessage(`Welcome ${bestMatch.name} — marked present (dist=${distance.toFixed(3)}).`);
      } else {
        setMessage(`No match found (closest avg dist=${distance.toFixed(3)}).`);
      }
    } catch (err) {
      console.error("saveCheckIn error:", err);
      setMessage("Check-in failed. See console.");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Student Check-in</h3>

      <div className="mb-3">
        <div className="flex gap-3 items-start">
          <div>
            <video ref={videoRef} className="rounded border" style={{ width: 320, height: 240, backgroundColor: "#000" }} autoPlay playsInline muted />
            <div className="flex gap-2 mt-2">
              <button onClick={openCamera} disabled={streamActive} className="px-3 py-1 rounded bg-blue-600 text-white">
                Start Camera
              </button>
              <button onClick={captureToPreview} disabled={!streamActive} className="px-3 py-1 rounded bg-green-600 text-white">
                Capture
              </button>
              <button onClick={stopCamera} disabled={!streamActive} className="px-3 py-1 rounded bg-red-600 text-white">
                Stop
              </button>
            </div>
          </div>

          <div className="ml-3">
            <div className="text-sm text-gray-600 mb-1">Preview</div>
            <img ref={imgRef} src="" alt="snapshot" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
            <div className="mt-2">
              <button onClick={saveCheckIn} className="px-3 py-1 rounded bg-indigo-600 text-white">
                Save Check-in
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <strong>Status:</strong> {message}
        </div>

        {lastAttendance && (
          <div className="mt-3 p-2 bg-gray-50 rounded border">
            <div className="text-sm font-medium">Last check-in</div>
            <div className="text-xs">{lastAttendance.name} — {new Date(lastAttendance.timestampISO).toLocaleString()}</div>
            <div className="text-xs text-gray-500">distance: {lastAttendance.distance.toFixed(3)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
