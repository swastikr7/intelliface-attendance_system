import React, { useEffect, useRef, useState } from "react";

const FaceScanner = ({ onFaceDetected }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Simulate face detection after camera starts
        setTimeout(() => {
          setScanning(false);
          onFaceDetected(true);
        }, 3000);
      } catch (err) {
        console.error(err);
        setError("Camera access denied or not available");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onFaceDetected]);

  if (error) {
    return (
      <div style={{ color: "red", marginTop: "10px" }}>
        ❌ {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="300"
        style={{
          borderRadius: "10px",
          border: "2px solid #00bcd4",
        }}
      />

      {scanning && (
        <p style={{ marginTop: "10px" }}>
          📷 Scanning face… Please look at the camera
        </p>
      )}
    </div>
  );
};

export default FaceScanner;
