// src/utils/faceUtils.js
// Utility helpers for face-api.js workflows used by FaceScanner, EnrollStudent, etc.
//
// Exports (named):
// - loadFaceModels()
// - computeDescriptorFromVideo(videoEl, options)
// - computeDescriptorFromImageElement(imgEl, options)
// - euclideanDistance(d1, d2)
// - findBestMatch(queryDescriptor, labeledDescriptors)
// - descriptorToJSON(descriptor)
// - descriptorFromJSON(arr)
// - loadLabeledDescriptors({ localStorageKey, fallbackUrl })
// - saveLabeledDescriptorsToLocalStorage(labeledDescriptors, { localStorageKey })
//
// NOTE: This file expects you to have face-api.js models hosted at /models
// (tiny_face_detector, face_landmark_68_model, face_recognition_model)

import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

/**
 * Loads the minimal set of face-api models we need: tiny detector, landmarks, recognition.
 */
export async function loadFaceModels() {
  // tiny detector for speed
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

/**
 * Compute a single-face descriptor (Float32Array) from a <video> element.
 * Returns Float32Array or null if no face found.
 *
 * Options can be passed to TinyFaceDetectorOptions, for example: { inputSize: 160, scoreThreshold: 0.5 }
 */
export async function computeDescriptorFromVideo(videoEl, options = {}) {
  if (!videoEl) return null;
  const detectorOptions = new faceapi.TinyFaceDetectorOptions(options);
  const detection = await faceapi
    .detectSingleFace(videoEl, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
}

/**
 * Compute a single-face descriptor (Float32Array) from an <img> element.
 * Returns Float32Array or null if no face found.
 */
export async function computeDescriptorFromImageElement(imgEl, options = {}) {
  if (!imgEl) return null;
  const detectorOptions = new faceapi.TinyFaceDetectorOptions(options);
  const detection = await faceapi
    .detectSingleFace(imgEl, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
}

/**
 * Euclidean distance between two descriptors (Float32Array or Array).
 */
export function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Find the best match from queryDescriptor across labeledDescriptors.
 * labeledDescriptors: [{ studentId, name, descriptor: Float32Array | Array }]
 * Returns: { studentId, name, distance, descriptor } or null.
 */
export function findBestMatch(queryDescriptor, labeledDescriptors = []) {
  if (!queryDescriptor || !labeledDescriptors || labeledDescriptors.length === 0) return null;
  let best = { studentId: null, name: null, distance: Infinity, descriptor: null };
  for (const ld of labeledDescriptors) {
    const target = ld.descriptor instanceof Float32Array ? ld.descriptor : Float32Array.from(ld.descriptor || []);
    const dist = euclideanDistance(queryDescriptor, target);
    if (dist < best.distance) {
      best = { studentId: ld.studentId || null, name: ld.name || null, distance: dist, descriptor: target };
    }
  }
  return best.studentId ? best : null;
}

/**
 * Convert Float32Array descriptor -> plain Array for JSON storage.
 */
export function descriptorToJSON(descriptor) {
  if (!descriptor) return null;
  return Array.from(descriptor);
}

/**
 * Convert plain Array -> Float32Array.
 */
export function descriptorFromJSON(arr) {
  if (!arr) return null;
  return Float32Array.from(arr);
}

/**
 * Load labeled descriptors from localStorage (key = 'descriptors') first, else fetch fallbackUrl (/descriptors.json).
 * Returns array of { studentId, name, descriptor: Float32Array }.
 */
export async function loadLabeledDescriptors({ localStorageKey = "descriptors", fallbackUrl = "/descriptors.json" } = {}) {
  // Try localStorage
  try {
    const ls = localStorage.getItem(localStorageKey);
    if (ls) {
      const parsed = JSON.parse(ls);
      return (parsed || []).map((r) => ({
        studentId: r.studentId,
        name: r.name,
        descriptor: descriptorFromJSON(r.descriptor),
      }));
    }
  } catch (e) {
    // fallthrough to fetch
    // console.warn("loadLabeledDescriptors: localStorage parse error", e);
  }

  // Fallback fetch
  try {
    const res = await fetch(fallbackUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    return (json || []).map((r) => ({
      studentId: r.studentId,
      name: r.name,
      descriptor: descriptorFromJSON(r.descriptor),
    }));
  } catch (e) {
    // If fetch fails, return empty array
    // console.warn("loadLabeledDescriptors: fetch error", e);
    return [];
  }
}

/**
 * Save labeled descriptors into localStorage (demo).
 * Input labeledDescriptors: [{ studentId, name, descriptor: Float32Array|Array }]
 */
export function saveLabeledDescriptorsToLocalStorage(labeledDescriptors, { localStorageKey = "descriptors" } = {}) {
  if (!Array.isArray(labeledDescriptors)) return;
  const toSave = labeledDescriptors.map((r) => ({
    studentId: r.studentId,
    name: r.name,
    descriptor: Array.isArray(r.descriptor) ? r.descriptor : Array.from(r.descriptor || []),
  }));
  localStorage.setItem(localStorageKey, JSON.stringify(toSave));
}
