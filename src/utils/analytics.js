// src/utils/analytics.js
import { getAttendance } from "./attendance";

/**
 * Calculate overall attendance percentage
 */
export function getOverallAttendance() {
  const records = getAttendance();

  if (records.length === 0) {
    return {
      present: 0,
      total: 0,
      percentage: 0,
    };
  }

  const present = records.filter(
    (r) => r.status === "Present"
  ).length;

  const total = records.length;

  const percentage = Math.round((present / total) * 100);

  return {
    present,
    total,
    percentage,
  };
}

/**
 * Calculate subject-wise attendance
 * (Subjects are mocked for demo)
 */
export function getSubjectWiseAttendance() {
  const records = getAttendance();

  // Mock subject assignment (demo-friendly)
  const subjects = ["Maths", "DSA", "OS", "DBMS"];

  const subjectStats = {};

  subjects.forEach((sub) => {
    subjectStats[sub] = {
      present: 0,
      total: 0,
      percentage: 0,
      status: "Safe",
    };
  });

  records.forEach((r, index) => {
    const subject = subjects[index % subjects.length];
    subjectStats[subject].total += 1;

    if (r.status === "Present") {
      subjectStats[subject].present += 1;
    }
  });

  Object.keys(subjectStats).forEach((sub) => {
    const s = subjectStats[sub];
    s.percentage =
      s.total === 0
        ? 0
        : Math.round((s.present / s.total) * 100);

    if (s.percentage >= 75) s.status = "Safe";
    else if (s.percentage >= 60) s.status = "Warning";
    else s.status = "Critical";
  });

  return subjectStats;
}

/**
 * Generate smart insights based on attendance
 */
export function getAttendanceInsights() {
  const { percentage } = getOverallAttendance();
  const subjects = getSubjectWiseAttendance();

  const insights = [];

  if (percentage >= 75) {
    insights.push("✅ Your attendance is above 75%. You are safe for exams.");
  } else {
    insights.push("⚠️ Your attendance is below 75%. Attend more classes.");
  }

  Object.keys(subjects).forEach((sub) => {
    const s = subjects[sub];
    if (s.status === "Critical") {
      insights.push(
        `❗ ${sub} attendance is critically low (${s.percentage}%).`
      );
    }
  });

  return insights;
}
