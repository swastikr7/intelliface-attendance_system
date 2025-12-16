const STORAGE_KEY = "intelliface_enrolled_students";

export function getEnrolledStudents() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function enrollStudent(student) {
  const existing = getEnrolledStudents();

  const alreadyExists = existing.some(
    (s) => s.roll === student.roll
  );

  if (alreadyExists) {
    return { success: false, message: "Student already enrolled" };
  }

  const updated = [
    ...existing,
    {
      id: Date.now(),
      name: student.name,
      roll: student.roll,
      faceDescriptor: student.faceDescriptor, // 👈 REAL IDENTITY
      enrolledAt: new Date().toLocaleString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { success: true };
}
