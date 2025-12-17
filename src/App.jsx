import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboards */}
      <Route path="/student/portal" element={<StudentPortal />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

