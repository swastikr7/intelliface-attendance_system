// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Pages */
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentPortal from "./pages/StudentPortal";
import Enrollment from "./pages/Enrollment";

/* Auth */
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const auth = useAuth();
  const user = auth?.user;

  return (
    <Routes>
      {/* ===== Landing Page ===== */}
      <Route path="/" element={<Landing />} />

      {/* ===== Auth Pages ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ===== Protected Routes ===== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === "teacher" ? (
              <TeacherDashboard />
            ) : (
              <StudentDashboard />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/student-portal"
        element={
          <ProtectedRoute>
            <StudentPortal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enrollment"
        element={
          <ProtectedRoute>
            <Enrollment />
          </ProtectedRoute>
        }
      />

      {/* ===== Fallback ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
