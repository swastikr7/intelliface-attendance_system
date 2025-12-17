// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    // 🔥 DEMO LOGIN BYPASS (NO BACKEND, NO UI CHANGE)
    setTimeout(() => {
      setLoading(false);

      if (role === "teacher") {
        // ✅ MATCHES App.jsx
        navigate("/teacher/enrollment");
      } else {
        // ✅ MATCHES App.jsx
        navigate("/student/portal");
      }
    }, 300);
  }

  return (
    <section className="auth-float">
      <h1 className="brand-title-float">IntelliFace</h1>
      <h2 className="auth-heading-float">Welcome back</h2>
      <p className="auth-subtitle">Sign in to continue</p>

      <form onSubmit={submit} className="auth-form-float">
        {/* Role Selection */}
        <div className="role-row-float">
          <div
            className={`pill-float ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            Student
          </div>

          <div
            className={`pill-float ${role === "teacher" ? "active" : ""}`}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </div>
        </div>

        {/* Auto-filled demo credentials */}
        <input
          className="input-float"
          placeholder="Email (auto-filled)"
          value={role === "teacher" ? "teacher@demo.com" : "student@demo.com"}
          disabled
        />

        <input
          className="input-float"
          type="password"
          placeholder="Password (auto-filled)"
          value="123456"
          disabled
        />

        {err && <div className="error-float">{err}</div>}

        <button className="btn-float" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <Link to="/signup" className="link-float">
          Create account
        </Link>
      </form>
    </section>
  );
}
