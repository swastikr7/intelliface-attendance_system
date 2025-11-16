// src/api/mockApi.js
// Simple mock API for frontend demos. Replace with real API calls later.

const MOCK_DB_KEY = "intelli-mock-db";

function readDb() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_DB_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeDb(db) {
  try {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
  } catch {}
}
function delay(ms = 600) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function checkIn(user = {}, imageBase64 = null) {
  await delay(700);
  if (!user || !user.email) {
    const e = new Error("Invalid user");
    e.status = 400;
    throw e;
  }
  const db = readDb();
  if (!db.attendance) db.attendance = {};
  if (!Array.isArray(db.attendance[user.email])) db.attendance[user.email] = [];
  const record = { ts: new Date().toISOString(), status: "Present", image: imageBase64 || null, note: "Checked in (mock API)" };
  db.attendance[user.email].unshift(record);
  db.attendance[user.email] = db.attendance[user.email].slice(0, 50);
  writeDb(db);
  return { ok: true, record };
}

export async function fetchAttendance(email) {
  await delay(300);
  const db = readDb();
  return (db.attendance && db.attendance[email]) || [];
}

export async function fetchClassSummary() {
  await delay(350);
  return {
    totalStudents: 32,
    presentToday: Math.floor(20 + Math.random() * 12),
    avgEngagement: Math.floor(60 + Math.random() * 30),
    lastUpdated: new Date().toISOString()
  };
}

export async function fetchRecentCheckins(limit = 8) {
  await delay(300);
  const db = readDb();
  const att = db.attendance || {};
  const all = Object.keys(att).flatMap((email) => att[email].map((r) => ({ email, ...r })));
  all.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  return all.slice(0, limit);
}
