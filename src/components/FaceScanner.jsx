import React, { useEffect } from "react";

const FaceScanner = ({ onFaceDetected }) => {
  useEffect(() => {
    // Simulate face scanning delay
    const timer = setTimeout(() => {
      // Always success for demo
      onFaceDetected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFaceDetected]);

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "300px",
      }}
    >
      <p>📷 Scanning face...</p>
      <p>Please look at the camera</p>
    </div>
  );
};

export default FaceScanner;
