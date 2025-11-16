// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AuthContext with deterministic demo accounts.
 * Demo accounts (when API_HOST === ''):
 *  - student@demo.com / 123456  -> role: student
 *  - teacher@demo.com / 123456  -> role: teacher
 *
 * This version normalizes role casing and ensures stored user has a lower-case role.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (!raw) return null;
      // normalize role to lower-case if present
      if (raw.role) raw.role = String(raw.role).toLowerCase();
      return raw;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [loading, setLoading] = useState(false);

  // Keep empty for demo mode.
  const API_HOST = "";

  const demoUsers = {
    "student@demo.com": { name: "Demo Student", email: "student@demo.com", role: "student", id: "demo-student" },
    "teacher@demo.com": { name: "Demo Teacher", email: "teacher@demo.com", role: "teacher", id: "demo-teacher" },
  };
  const demoPassword = "123456";

  useEffect(() => {
    // Optionally validate token here
  }, []);

  function apiUrl(path) {
    if (!API_HOST) return path;
    return `${API_HOST}${path}`;
  }

  function tryDemoLogin({ email, password }) {
    const lower = (email || "").toLowerCase();
    const userObj = demoUsers[lower];
    if (!userObj) return null;
    if (password !== demoPassword) return null;
    // ensure role normalized
    const normalized = { ...userObj, role: String(userObj.role).toLowerCase() };
    return { token: `demo-token-${userObj.id}-${Date.now()}`, user: normalized };
  }

  async function login({ email, password }) {
    setLoading(true);

    // If configured, try backend first
    if (API_HOST) {
      try {
        const res = await fetch(apiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(err.message || "Login failed");
        }
        const data = await res.json();
        // normalize role on returned user object
        if (data.user && data.user.role) data.user.role = String(data.user.role).toLowerCase();
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { ok: true, user: data.user };
      } catch (err) {
        setLoading(false);
        return { ok: false, error: err.message || "Login failed" };
      }
    }

    // Demo fallback
    const demo = tryDemoLogin({ email, password });
    if (demo) {
      localStorage.setItem("auth_token", demo.token);
      localStorage.setItem("auth_user", JSON.stringify(demo.user));
      setToken(demo.token);
      setUser(demo.user);
      setLoading(false);
      return { ok: true, user: demo.user };
    }

    setLoading(false);
    return { ok: false, error: "Invalid credentials (demo only)" };
  }

  async function signup({ name, email, password }) {
    setLoading(true);
    if (API_HOST) {
      try {
        const res = await fetch(apiUrl("/api/auth/signup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(err.message || "Signup failed");
        }
        const data = await res.json();
        if (data.user && data.user.role) data.user.role = String(data.user.role).toLowerCase();
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return { ok: true, user: data.user };
      } catch (err) {
        setLoading(false);
        return { ok: false, error: err.message || "Signup failed" };
      }
    }

    // Local demo signup: always create student
    const created = { name: name || email, email, role: "student", id: `local-${Date.now()}` };
    const t = `local-token-${created.id}`;
    localStorage.setItem("auth_token", t);
    localStorage.setItem("auth_user", JSON.stringify(created));
    setToken(t);
    setUser(created);
    setLoading(false);
    return { ok: true, user: created };
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }

  async function authFetch(input, init = {}) {
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(input, { ...init, headers });
    return res;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        authFetch,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
