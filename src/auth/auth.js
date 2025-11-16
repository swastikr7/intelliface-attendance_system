// src/auth/auth.js
// Simple demo auth helpers — client-side only (localStorage).
// Exports: currentUser, login, signup, logout

const DEMO = {
  student: { email: "student@demo.com", password: "123456", name: "Demo Student" },
  teacher: { email: "teacher@demo.com", password: "123456", name: "Demo Teacher" },
};

const STORAGE_KEY = "intelli-user";

/**
 * Return the currently stored user object or null.
 */
export function currentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Login with demo credentials.
 * Accepts { email, password, role } and throws on failure.
 * On success stores { email, role, name } in localStorage and returns it.
 */
export function login({ email = "", password = "", role = "student" }) {
  const normalized = String(email).trim().toLowerCase();
  const r = role === "teacher" ? "teacher" : "student";
  const correct = DEMO[r];

  if (!correct) throw new Error("Invalid role");

  if (normalized !== correct.email || String(password) !== correct.password) {
    throw new Error("Invalid email or password");
  }

  const user = { email: normalized, role: r, name: correct.name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Signup for demo: accepts info object, stores it and returns the stored user.
 * For demo we allow any signup and simply save the provided email+role.
 */
export function signup(info = {}) {
  const email = (info.email || "").trim().toLowerCase();
  const role = info.role === "teacher" ? "teacher" : "student";
  const name = (info.name || (role === "teacher" ? "Teacher" : "Student")).trim() || (role === "teacher" ? "Teacher" : "Student");

  const user = { email, role, name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Remove stored session.
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}
