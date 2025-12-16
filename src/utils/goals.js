// src/utils/goals.js
import { getAttendance } from "./attendance";

/**
 * Calculate weekly attendance goal progress
 * @param {number} target - number of classes to attend in a week
 */
export function getWeeklyGoal(target = 5) {
  const records = getAttendance();
  const now = new Date();

  // Start of current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyPresent = records.filter((r) => {
    const d = new Date(r.date);
    return d >= startOfWeek && r.status === "Present";
  });

  const completed = weeklyPresent.length;
  const percentage = Math.min(
    100,
    Math.round((completed / target) * 100)
  );

  return {
    target,              // e.g. 5 classes
    completed,           // classes attended this week
    remaining: Math.max(0, target - completed),
    percentage,          // progress %
  };
}
