import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";

const EnrollmentFaceCapture = ({ onDescriptorReady }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream;

    const start = async () => {
      try {
        // Load models once
        await loadFaceModels();

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Camera or model loading failed");
      }
    };

    start();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const captureDescriptor = async () => {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError("No face detected. Ensure good lighting.");
      return;
    }

    // Convert Float32Array → normal array for storage
    const descriptorArray = Array.from(detection.descriptor);

    onDescriptorReady(descriptorArray);
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      {loading && <p>Loading camera & models…</p>}

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="260"
        style={{ borderRadius: "10px", marginTop: "10px" }}
      />

      <button
        onClick={captureDescriptor}
        style={{ marginTop: "10px" }}
      >
        Capture Face
      </button>
    </div>
  );
};

export default EnrollmentFaceCapture;
