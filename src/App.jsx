import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Dashboards
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboards */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />
        <Route
          path="/teacher/dashboard"
          element={<TeacherDashboard />}
        />

        {/* Fallback */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
