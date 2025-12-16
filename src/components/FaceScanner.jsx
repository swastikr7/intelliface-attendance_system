import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";
import { getEnrolledStudents } from "../utils/enrollment";
import { matchFace } from "../utils/faceMatcher";

const FaceScanner = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let stream;

    const init = async () => {
      try {
        console.log("🔄 Loading face models...");
        await loadFaceModels();
        setModelsReady(true);

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
          console.log("📷 Camera ready");
        };
      } catch (err) {
        console.error(err);
        setError("Camera or model loading failed");
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const scanFace = async () => {
    setError("");

    if (!modelsReady || !cameraReady) {
      setError("Models or camera not ready yet. Please wait.");
      return;
    }

    const video = videoRef.current;

    console.log("🔍 Scanning face...");

    const detection = await faceapi
      .detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416, // safer
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError("No face detected. Ensure good lighting and face visibility.");
      return;
    }

    console.log("✅ Face detected");

    const enrolled = getEnrolledStudents();
    if (enrolled.length === 0) {
      setError("No enrolled students found.");
      return;
    }

    const matchedRoll = matchFace(
      Array.from(detection.descriptor),
      enrolled
    );

    if (!matchedRoll) {
      setError("Face not recognized. Attendance denied.");
      return;
    }

    console.log("🎯 Face matched:", matchedRoll);

    onFaceDetected(true, matchedRoll);
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="280"
        height="210"
        style={{ borderRadius: "10px", marginTop: "10px" }}
      />

      <button
        onClick={scanFace}
        disabled={!modelsReady || !cameraReady}
        style={{ marginTop: "10px" }}
      >
        Scan Face
      </button>

      {!modelsReady && <p>Loading face models…</p>}
      {!cameraReady && <p>Starting camera…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FaceScanner;
