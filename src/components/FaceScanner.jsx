import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";
import { getEnrolledStudents } from "../utils/enrollment";
import { matchFace } from "../utils/faceMatcher";

const FaceScanner = ({ onVerified }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  const [ready, setReady] = useState(false);
  const [verified, setVerified] = useState(false);
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
          setReady(true);
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
    if (!ready || verified || !mountedRef.current) return;

    setError("");

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

    if (!detections || detections.length !== 1) {
      setError("Ensure exactly one face is visible.");
      return;
    }

    const enrolled = getEnrolledStudents();
    if (!enrolled.length) {
      setError("No enrolled students found.");
      return;
    }

    const liveDescriptor = Array.from(detections[0].descriptor);
    const matchedRoll = matchFace(liveDescriptor, enrolled);

    if (!matchedRoll) {
      setError("Face not recognized.");
      return;
    }

    setVerified(true);

    if (typeof onVerified === "function") {
      onVerified(matchedRoll);
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

      {!verified ? (
        <button onClick={scanFace} style={{ marginTop: 10 }}>
          Scan Face
        </button>
      ) : (
        <p style={{ color: "lightgreen", marginTop: 10 }}>
          ✅ Face verified
        </p>
      )}

      {!ready && <p>Initializing camera…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FaceScanner;
