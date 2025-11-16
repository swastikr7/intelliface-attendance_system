// src/App.jsx
import React from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Enrollment from "./pages/Enrollment";
import StudentPortal from "./pages/StudentPortal";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* TopNav: role-aware navigation using AuthContext */
function TopNavInner() {
  const nav = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;

  const doLogout = () => {
    auth?.logout();
    nav("/login");
  };

  if (!user) {
    return (
      <header style={navStyle}>
        <Link to="/" style={brandStyle}>IntelliFace</Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/signup" style={linkStyle}>Sign up</Link>
        </div>
      </header>
    );
  }

  const role = String(user.role || "").toLowerCase();
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  return (
    <header style={navStyle}>
      <Link to="/" style={brandStyle}>IntelliFace</Link>

      {/* Student-facing portal (only meaningful if user.role === 'student') */}
      {isStudent && <Link to="/student" style={navLinkStyle}>Portal</Link>}
      {/* Provide access to legacy dashboard view for students if needed */}
      {isStudent && <Link to="/student-dashboard" style={navLinkStyle}>Dashboard</Link>}

      {/* Teacher-facing pages */}
      {isTeacher && <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>}
      {isTeacher && <Link to="/enroll" style={navLinkStyle}>Enrollment</Link>}

      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ color: "var(--muted)" }}>{user.name}</span>
        <button onClick={doLogout} style={logoutBtnStyle}>Logout</button>
      </div>
    </header>
  );
}

/* wrapper to use useNavigate inside header */
function TopNav() {
  return (
    <nav>
      <TopNavInner />
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* STUDENT-ONLY routes (protected to students) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classroom"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentPortal />
              </ProtectedRoute>
            }
          />

          {/* Backward-compatible student dashboard (optional) */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* TEACHER routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* enrollment: teacher-only */}
          <Route
            path="/enroll"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Enrollment />
              </ProtectedRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* small inline styles */
const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "12px 20px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  background: "transparent"
};
const brandStyle = { color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 18 };
const linkStyle = { color: "var(--muted)", textDecoration: "none" };
const navLinkStyle = { color: "var(--muted)", textDecoration: "none" };
const logoutBtnStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer"
};
