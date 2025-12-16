import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";
import { getEnrolledStudents } from "../utils/enrollment";
import { matchFace } from "../utils/faceMatcher";

const FaceScanner = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        await loadFaceModels();

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        videoRef.current.srcObject = stream;
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Camera or model loading failed");
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const scanFace = async () => {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError("No face detected. Try again.");
      return;
    }

    const enrolled = getEnrolledStudents();

    const matchedRoll = matchFace(
      Array.from(detection.descriptor),
      enrolled
    );

    if (!matchedRoll) {
      setError("Face not recognized. Attendance denied.");
      return;
    }

    // SUCCESS
    onFaceDetected(true, matchedRoll);
  };

  return (
    <div>
      {loading && <p>Loading camera & models…</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="260"
        style={{ borderRadius: "10px", marginTop: "10px" }}
      />

      <button onClick={scanFace} style={{ marginTop: "10px" }}>
        Scan Face
      </button>
    </div>
  );
};

export default FaceScanner;
