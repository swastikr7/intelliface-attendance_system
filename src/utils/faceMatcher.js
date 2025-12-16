import * as faceapi from "face-api.js";

/**
 * Compare live face descriptor with enrolled descriptors
 * @param {Array} liveDescriptor
 * @param {Array} enrolledStudents
 */
export function matchFace(liveDescriptor, enrolledStudents) {
  if (!liveDescriptor || enrolledStudents.length === 0) return null;

  const labeledDescriptors = enrolledStudents.map(
    (s) =>
      new faceapi.LabeledFaceDescriptors(
        s.roll,
        [new Float32Array(s.faceDescriptor)]
      )
  );

  const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

  const bestMatch = matcher.findBestMatch(
    new Float32Array(liveDescriptor)
  );

  if (bestMatch.label === "unknown") return null;

  return bestMatch.label; // roll number
}
