// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../auth/auth";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    roll: "",
    dept: ""
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password) return setErr("Please fill required fields");
    if (form.password.length < 6) return setErr("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setErr("Passwords do not match");

    setLoading(true);
    setTimeout(() => {
      try {
        signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role,
          roll: role === "student" ? form.roll : undefined,
          dept: role === "teacher" ? form.dept : undefined,
        });
        setLoading(false);
        if (role === "teacher") nav("/dashboard");
        else nav("/classroom");
      } catch (error) {
        setLoading(false);
        setErr(error.message || "Signup failed");
      }
    }, 500);
  };

  return (
    <section className="auth-float">
      <h1 className="brand-title-float">IntelliFace</h1>
      <h2 className="auth-heading-float">Create account</h2>
      <p className="auth-subtitle">Choose your role and sign up</p>

      <form onSubmit={submit} className="auth-form-float">

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

        <input
          className="input-float"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
        />

        <input
          className="input-float"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />

        <input
          className="input-float"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
        />

        <input
          className="input-float"
          type="password"
          placeholder="Confirm password"
          value={form.confirm}
          onChange={(e) => setField("confirm", e.target.value)}
        />

        {role === "student" && (
          <input
            className="input-float"
            placeholder="Roll number"
            value={form.roll}
            onChange={(e) => setField("roll", e.target.value)}
          />
        )}

        {role === "teacher" && (
          <input
            className="input-float"
            placeholder="Department"
            value={form.dept}
            onChange={(e) => setField("dept", e.target.value)}
          />
        )}

        {err && <div className="error-float">{err}</div>}

        <button className="btn-float" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>

      </form>
    </section>
  );
}
