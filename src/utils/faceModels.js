// src/utils/faceModels.js
import * as faceapi from "face-api.js";

let modelsLoaded = false;

/**
 * Load face-api models once
 */
export async function loadFaceModels() {
  if (modelsLoaded) return;

  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
  console.log("✅ Face-api models loaded");
}

/**
 * Check if models are loaded
 */
export function areModelsLoaded() {
  return modelsLoaded;
}
