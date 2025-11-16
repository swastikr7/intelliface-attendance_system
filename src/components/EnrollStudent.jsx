// src/components/EnrollStudent.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  loadFaceModels,
  computeDescriptorFromImageElement,
  loadLabeledDescriptors,
  saveLabeledDescriptorsToLocalStorage,
  descriptorToJSON,
} from "../utils/faceUtils";

const TEACHER_PASSCODE = "teacher123"; // demo-only, change if you want

export default function EnrollStudent({ onSaved = null }) {
  const videoRef = useRef(null);
  const preview1Ref = useRef(null);
  const preview2Ref = useRef(null);
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [img1, setImg1] = useState(null);
  const [img2, setImg2] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setMessage("Loading models...");
      try {
        await loadFaceModels();
        if (!mounted) return;
        setModelsLoaded(true);
        setMessage("Models loaded. Enter teacher passcode to enroll.");
      } catch (err) {
        console.error("Model load error:", err);
        setMessage("Failed to load models. Check /models path.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function authorize() {
    const p = prompt("Enter teacher passcode (demo):");
    if (p === TEACHER_PASSCODE) {
      setAuthorized(true);
      setMessage("Authorized. Start camera to enroll students.");
    } else {
      setMessage("Incorrect passcode.");
      setAuthorized(false);
    }
  }

  async function openCamera() {
    if (!modelsLoaded) {
      setMessage("Models still loading. Wait a moment.");
      return;
    }
    if (!authorized) {
      setMessage("Not authorized. Use teacher passcode.");
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
        setMessage("Camera started. Capture two images at different angles.");
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
    } catch (e) {}
    setStreamActive(false);
    setMessage("Camera stopped.");
  }

  function captureSnapshot(target = 1) {
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
    if (target === 1) {
      setImg1(dataUrl);
      if (preview1Ref.current) preview1Ref.current.src = dataUrl;
    } else {
      setImg2(dataUrl);
      if (preview2Ref.current) preview2Ref.current.src = dataUrl;
    }
    setMessage(`Captured image ${target}.`);
  }

  async function saveEnrollment() {
    if (!img1 || !img2) {
      setMessage("Capture both images before saving (two snapshots).");
      return;
    }
    if (!name && !studentId) {
      setMessage("Enter student name or ID.");
      return;
    }
    setSaving(true);
    setMessage("Computing descriptors...");
    try {
      // create image elements for both previews
      const imgEl1 = preview1Ref.current;
      const imgEl2 = preview2Ref.current;
      if (!imgEl1 || !imgEl2) {
        setMessage("Preview images missing.");
        setSaving(false);
        return;
      }

      const d1 = await computeDescriptorFromImageElement(imgEl1, { inputSize: 160 });
      const d2 = await computeDescriptorFromImageElement(imgEl2, { inputSize: 160 });

      if (!d1 || !d2) {
        setMessage("Face not found in one of the snapshots. Retake.");
        setSaving(false);
        return;
      }

      const id = (studentId && studentId.trim()) || `s-${Date.now()}`;
      const nm = (name && name.trim()) || id;

      const record = {
        studentId: id,
        name: nm,
        descriptors: [descriptorToJSON(d1), descriptorToJSON(d2)],
      };

      const existing = await loadLabeledDescriptors({ localStorageKey: "descriptors" });
      // if studentId exists, update (append descriptors)
      const idx = existing.findIndex((r) => r.studentId === id);
      if (idx >= 0) {
        // append new descriptors (avoid duplicates)
        existing[idx].name = nm;
        existing[idx].descriptors = existing[idx].descriptors.concat(record.descriptors);
      } else {
        existing.push(record);
      }

      saveLabeledDescriptorsToLocalStorage(existing, { localStorageKey: "descriptors" });
      setMessage(`Enrollment saved for ${nm} (${id}).`);
      setSaving(false);
      setImg1(null);
      setImg2(null);
      if (typeof onSaved === "function") onSaved(record);
    } catch (err) {
      console.error("saveEnrollment error:", err);
      setMessage("Failed to compute/save descriptor. See console.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Enroll Student (Teacher)</h3>

      <div className="mb-2">
        {!authorized ? (
          <button onClick={authorize} className="px-3 py-1 rounded bg-yellow-600 text-white">
            Enter Teacher Passcode
          </button>
        ) : (
          <div className="text-sm text-green-600">Teacher authorized</div>
        )}
      </div>

      <div className="grid gap-2">
        <input className="border px-2 py-1 rounded" placeholder="Student name (e.g., Alice)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border px-2 py-1 rounded" placeholder="Student ID (optional)" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      </div>

      <div className="mt-3">
        <div className="flex gap-2 items-start">
          <div>
            <video ref={videoRef} className="rounded border" style={{ width: 320, height: 240, backgroundColor: "#000" }} autoPlay playsInline muted />
            <div className="flex gap-2 mt-2">
              <button onClick={openCamera} disabled={streamActive} className={`px-3 py-1 rounded text-white ${streamActive ? "bg-gray-400" : "bg-blue-600"}`}>
                Start Camera
              </button>
              <button onClick={() => captureSnapshot(1)} disabled={!streamActive} className="px-3 py-1 rounded bg-green-600 text-white">
                Capture 1
              </button>
              <button onClick={() => captureSnapshot(2)} disabled={!streamActive} className="px-3 py-1 rounded bg-green-600 text-white">
                Capture 2
              </button>
              <button onClick={stopCamera} disabled={!streamActive} className="px-3 py-1 rounded bg-red-600 text-white">
                Stop
              </button>
            </div>
          </div>

          <div className="ml-3">
            <div className="text-sm mb-1">Previews (capture 2)</div>
            <img ref={preview1Ref} src={img1 || ""} alt="preview1" style={{ width: 150, height: 110, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
            <img ref={preview2Ref} src={img2 || ""} alt="preview2" style={{ width: 150, height: 110, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd", marginTop: 6 }} />
            <div className="mt-2">
              <button onClick={saveEnrollment} disabled={saving || !img1 || !img2} className={`px-3 py-1 rounded text-white ${saving ? "bg-gray-400" : "bg-indigo-600"}`}>
                {saving ? "Saving..." : "Save Enrollment"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <strong>Status:</strong> {message}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Tip: capture images at slightly different angles/lighting. Teacher passcode is required to enroll.
        </div>
      </div>
    </div>
  );
}
