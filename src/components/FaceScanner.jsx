import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadFaceModels } from "../utils/faceModels";
import { getEnrolledStudents } from "../utils/enrollment";
import { matchFace } from "../utils/faceMatcher";

const FaceScanner = ({ onFaceDetected }) => {
  const videoRef = useRef(null);

  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [scanned, setScanned] = useState(false); // 🔒 scan lock

  useEffect(() => {
    let stream;

    const init = async () => {
      try {
        await loadFaceModels();

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();

          // Force dimensions (critical for face-api)
          videoRef.current.width = 320;
          videoRef.current.height = 240;

          setTimeout(() => {
            setReady(true);
            console.log(
              "🎥 Video ready:",
              videoRef.current.videoWidth,
              videoRef.current.videoHeight
            );
          }, 300);
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
    if (scanned) return; // 🔒 prevent double execution
    setScanned(true);
    setError("");

    if (!ready) {
      setError("Camera not ready yet. Please wait.");
      setScanned(false);
      return;
    }

    const video = videoRef.current;

    console.log(
      "🔍 Scanning with dimensions:",
      video.videoWidth,
      video.videoHeight
    );

    const detections = await faceapi
      .detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {
      setError("No face detected. Ensure good lighting.");
      setScanned(false);
      return;
    }

    if (detections.length > 1) {
      setError("Multiple faces detected. Only one face allowed.");
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
      setError("Face not recognized. Attendance denied.");
      setScanned(false);
      return;
    }

    console.log("✅ Face matched:", matchedRoll);

    // SUCCESS → notify parent ONCE
    onFaceDetected(true, matchedRoll);
  };

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "320px",
          height: "240px",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      />

      <button
        onClick={scanFace}
        style={{ marginTop: "10px" }}
      >
        Scan Face
      </button>

      {!ready && <p>Initializing camera…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FaceScanner;
