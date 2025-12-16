import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";
import { getEnrolledStudents } from "../utils/enrollment";
import { matchFace } from "../utils/faceMatcher";

const FaceScanner = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const mountedRef = useRef(true); // 🔑 critical
  const streamRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      try {
        await loadFaceModels();
        if (!mountedRef.current) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!mountedRef.current) return;

        streamRef.current = stream;

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          if (!mountedRef.current || !videoRef.current) return;

          await videoRef.current.play();

          videoRef.current.width = 320;
          videoRef.current.height = 240;

          setReady(true);
          console.log(
            "🎥 Video ready:",
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
        };
      } catch (err) {
        if (mountedRef.current) {
          console.error(err);
          setError("Camera or model loading failed");
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const scanFace = async () => {
    if (scanned || !mountedRef.current) return;
    setScanned(true);
    setError("");

    if (!ready || !videoRef.current) {
      setError("Camera not ready yet.");
      setScanned(false);
      return;
    }

    const detections = await faceapi
      .detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!mountedRef.current) return;

    if (!detections || detections.length === 0) {
      setError("No face detected.");
      setScanned(false);
      return;
    }

    if (detections.length > 1) {
      setError("Multiple faces detected.");
      setScanned(false);
      return;
    }

    const enrolled = getEnrolledStudents();
    if (enrolled.length === 0) {
      setError("No enrolled students found.");
      setScanned(false);
      return;
    }

    const liveDescriptor = Array.from(detections[0].descriptor);
    const matchedRoll = matchFace(liveDescriptor, enrolled);

    if (!matchedRoll) {
      setError("Face not recognized.");
      setScanned(false);
      return;
    }

    if (mountedRef.current) {
      console.log("✅ Face matched:", matchedRoll);
      onFaceDetected(true, matchedRoll);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: 320, height: 240, borderRadius: 10 }}
      />

      <button onClick={scanFace} style={{ marginTop: 10 }}>
        Scan Face
      </button>

      {!ready && <p>Initializing camera…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FaceScanner;
