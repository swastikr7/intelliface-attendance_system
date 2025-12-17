import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import StudentPortal from "./pages/StudentPortal";
import Enrollment from "./pages/Enrollment";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student */}
      <Route path="/student/portal" element={<StudentPortal />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />

      {/* Teacher */}
      <Route path="/teacher/enrollment" element={<Enrollment />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

      {/* SAFE FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
