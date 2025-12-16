// src/utils/gamification.js
import { getAttendance } from "./attendance";

/**
 * Calculate attendance score (0–100)
 */
export function calculateAttendanceScore() {
  const attendance = getAttendance();
  if (attendance.length === 0) return 0;

  const presentCount = attendance.filter(
    (a) => a.status === "Present"
  ).length;

  const score = Math.min(100, presentCount * 20);
  return score;
}

/**
 * Calculate consecutive attendance streak
 */
export function calculateStreak() {
  const attendance = getAttendance();
  if (attendance.length === 0) return 0;

  const dates = attendance
    .map((a) => new Date(a.date))
    .sort((a, b) => b - a);

  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

/**
 * Determine student engagement level
 */
export function getEngagementLevel(score) {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 30) return "Intermediate";
  return "Beginner";
}

/**
 * Get earned badges
 */
export function getBadges(score, streak) {
  const badges = [];

  if (score > 0) badges.push("🏅 First Attendance");
  if (streak >= 3) badges.push("🔥 3-Day Streak");
  if (streak >= 7) badges.push("🚀 7-Day Streak");
  if (score >= 75) badges.push("🎯 75% Attendance");
  if (score === 100) badges.push("⭐ Perfect Attendance");

  return badges;
}
