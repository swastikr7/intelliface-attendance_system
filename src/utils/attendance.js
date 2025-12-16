// src/utils/attendance.js

const STORAGE_KEY = "intelliface_attendance";

/**
 * Get all attendance records
 */
export function getAttendance() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading attendance:", err);
    return [];
  }
}

/**
 * Add a new attendance record
 */
export function addAttendance(record) {
  try {
    const existing = getAttendance();

    const updated = [
      ...existing,
      {
        ...record,
        id: Date.now(), // unique ID
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error("Error saving attendance:", err);
    return false;
  }
}

/**
 * Clear attendance (optional – for testing/demo)
 */
export function clearAttendance() {
  localStorage.removeItem(STORAGE_KEY);
}
